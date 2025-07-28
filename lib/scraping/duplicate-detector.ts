import { ScrapedJob } from '../../types/scraping'
import { supabase } from '../supabase'
import { createHash } from 'crypto'

export interface DuplicateMatch {
  existingJobId: number
  similarity: number
  matchType: 'exact' | 'similar' | 'potential'
  matchFields: string[]
}

export interface DeduplicationResult {
  isLikeDuplicate: boolean
  duplicateMatch?: DuplicateMatch
  confidence: number
  reasons: string[]
}

export class DuplicateDetector {
  private static readonly SIMILARITY_THRESHOLDS = {
    exact: 0.95,
    similar: 0.85,
    potential: 0.70
  }

  // Check if a scraped job is a duplicate of existing jobs in the database
  static async checkForDuplicates(job: ScrapedJob): Promise<DeduplicationResult> {
    try {
      // First check for exact external_id match
      if (job.external_id) {
        const exactMatch = await this.checkExactMatch(job)
        if (exactMatch) {
          return {
            isLikeDuplicate: true,
            duplicateMatch: exactMatch,
            confidence: 1.0,
            reasons: ['Exact external ID match']
          }
        }
      }

      // Check for similar jobs based on content similarity
      const similarJobs = await this.findSimilarJobs(job)
      if (similarJobs.length > 0) {
        const bestMatch = similarJobs[0] // Already sorted by similarity
        
        if (bestMatch.similarity >= this.SIMILARITY_THRESHOLDS.exact) {
          return {
            isLikeDuplicate: true,
            duplicateMatch: bestMatch,
            confidence: bestMatch.similarity,
            reasons: [`High similarity match (${(bestMatch.similarity * 100).toFixed(1)}%)`]
          }
        } else if (bestMatch.similarity >= this.SIMILARITY_THRESHOLDS.similar) {
          return {
            isLikeDuplicate: true,
            duplicateMatch: bestMatch,
            confidence: bestMatch.similarity,
            reasons: [`Similar job found (${(bestMatch.similarity * 100).toFixed(1)}%)`]
          }
        } else if (bestMatch.similarity >= this.SIMILARITY_THRESHOLDS.potential) {
          return {
            isLikeDuplicate: false, // Don't skip, but flag as potential duplicate
            duplicateMatch: bestMatch,
            confidence: bestMatch.similarity,
            reasons: [`Potential duplicate (${(bestMatch.similarity * 100).toFixed(1)}%)`]
          }
        }
      }

      return {
        isLikeDuplicate: false,
        confidence: 0,
        reasons: ['No duplicates found']
      }

    } catch (error) {
      console.error('Error checking for duplicates:', error)
      return {
        isLikeDuplicate: false,
        confidence: 0,
        reasons: ['Error occurred during duplicate check']
      }
    }
  }

  private static async checkExactMatch(job: ScrapedJob): Promise<DuplicateMatch | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company, location')
      .eq('external_id', job.external_id)
      .single()

    if (error || !data) {
      return null
    }

    return {
      existingJobId: data.id,
      similarity: 1.0,
      matchType: 'exact',
      matchFields: ['external_id']
    }
  }

  private static async findSimilarJobs(job: ScrapedJob): Promise<DuplicateMatch[]> {
    // Search for jobs with similar title, company, and location
    // Posted within the last 30 days to avoid matching very old jobs
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: candidateJobs, error } = await supabase
      .from('jobs')
      .select('id, title, company, location, description, posted_date')
      .gte('posted_date', thirtyDaysAgo)
      .eq('is_active', true)

    if (error || !candidateJobs) {
      return []
    }

    const matches: DuplicateMatch[] = []

    for (const candidate of candidateJobs) {
      const similarity = this.calculateSimilarity(job, candidate)
      
      if (similarity >= this.SIMILARITY_THRESHOLDS.potential) {
        const matchFields = this.identifyMatchingFields(job, candidate)
        
        matches.push({
          existingJobId: candidate.id,
          similarity,
          matchType: similarity >= this.SIMILARITY_THRESHOLDS.exact ? 'exact' :
                    similarity >= this.SIMILARITY_THRESHOLDS.similar ? 'similar' : 'potential',
          matchFields
        })
      }
    }

    // Sort by similarity (highest first)
    return matches.sort((a, b) => b.similarity - a.similarity)
  }

  private static calculateSimilarity(job1: ScrapedJob, job2: any): number {
    let totalWeight = 0
    let matchedWeight = 0

    // Title similarity (weight: 40%)
    const titleWeight = 0.4
    const titleSimilarity = this.stringSimilarity(
      this.normalizeString(job1.title), 
      this.normalizeString(job2.title)
    )
    totalWeight += titleWeight
    matchedWeight += titleSimilarity * titleWeight

    // Company similarity (weight: 30%)
    const companyWeight = 0.3
    const companySimilarity = this.stringSimilarity(
      this.normalizeString(job1.company), 
      this.normalizeString(job2.company)
    )
    totalWeight += companyWeight
    matchedWeight += companySimilarity * companyWeight

    // Location similarity (weight: 20%)
    const locationWeight = 0.2
    const locationSimilarity = this.stringSimilarity(
      this.normalizeString(job1.location), 
      this.normalizeString(job2.location)
    )
    totalWeight += locationWeight
    matchedWeight += locationSimilarity * locationWeight

    // Description similarity (weight: 10%)
    if (job1.description && job2.description) {
      const descriptionWeight = 0.1
      const descriptionSimilarity = this.stringSimilarity(
        this.normalizeString(job1.description.substring(0, 200)), // First 200 chars
        this.normalizeString(job2.description.substring(0, 200))
      )
      totalWeight += descriptionWeight
      matchedWeight += descriptionSimilarity * descriptionWeight
    }

    return totalWeight > 0 ? matchedWeight / totalWeight : 0
  }

  private static identifyMatchingFields(job1: ScrapedJob, job2: any): string[] {
    const matchingFields: string[] = []
    const threshold = 0.8 // 80% similarity to consider a field "matching"

    if (this.stringSimilarity(this.normalizeString(job1.title), this.normalizeString(job2.title)) >= threshold) {
      matchingFields.push('title')
    }

    if (this.stringSimilarity(this.normalizeString(job1.company), this.normalizeString(job2.company)) >= threshold) {
      matchingFields.push('company')
    }

    if (this.stringSimilarity(this.normalizeString(job1.location), this.normalizeString(job2.location)) >= threshold) {
      matchingFields.push('location')
    }

    return matchingFields
  }

  // Calculate string similarity using Jaccard similarity with n-grams
  private static stringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0
    if (!str1 || !str2) return 0.0

    const ngrams1 = this.generateNgrams(str1, 3)
    const ngrams2 = this.generateNgrams(str2, 3)

    const set1 = new Set(ngrams1)
    const set2 = new Set(ngrams2)

    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])

    return union.size > 0 ? intersection.size / union.size : 0
  }

  private static generateNgrams(text: string, n: number): string[] {
    const ngrams: string[] = []
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    
    for (let i = 0; i <= normalizedText.length - n; i++) {
      ngrams.push(normalizedText.substring(i, i + n))
    }
    
    return ngrams
  }

  private static normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
  }

  // Generate a content-based hash for a job (alternative to external_id)
  static generateContentHash(job: ScrapedJob): string {
    const content = [
      this.normalizeString(job.title),
      this.normalizeString(job.company),
      this.normalizeString(job.location),
      job.posted_date
    ].join('|')

    return createHash('sha256').update(content).digest('hex').substring(0, 16)
  }

  // Batch process multiple jobs for duplicates
  static async batchCheckDuplicates(jobs: ScrapedJob[]): Promise<Array<{
    job: ScrapedJob
    result: DeduplicationResult
  }>> {
    const results: Array<{ job: ScrapedJob, result: DeduplicationResult }> = []

    for (const job of jobs) {
      const result = await this.checkForDuplicates(job)
      results.push({ job, result })

      // Add small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return results
  }

  // Clean up old duplicates and mark inactive jobs
  static async cleanupOldJobs(daysOld: number = 90): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString()

    try {
      // Mark very old jobs as inactive
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: false })
        .lt('posted_date', cutoffDate)
        .eq('is_active', true)

      if (error) {
        console.error('Error cleaning up old jobs:', error)
      } else {
        console.log(`Cleaned up jobs older than ${daysOld} days`)
      }
    } catch (error) {
      console.error('Error in cleanup process:', error)
    }
  }
}