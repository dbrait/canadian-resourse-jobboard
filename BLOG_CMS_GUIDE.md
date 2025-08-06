# Blog Content Management System Guide

## Overview
The Resource Careers Canada blog CMS provides a simple interface for creating, editing, and managing blog posts with SEO optimization features.

## Accessing the Admin Panel

1. Navigate to `/admin/blog` on your website
2. Enter the admin password (default: `resourceadmin2025`)
3. You'll see a list of all blog posts

## Creating a New Post

1. Click "New Post" in the admin panel
2. Choose a template to start with:
   - **Career Guide Template**: For role-specific career guides
   - **Industry Insight Template**: For market analysis and trends
   - **Job Trends Template**: For monthly job market reports

3. Fill in the required fields:
   - **Title**: The main title of your post
   - **Category**: Choose from Insights, Guides, Trends, News, or Analysis
   - **Content**: Write in Markdown format (preview available)

### Markdown Syntax Guide

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

[Link text](https://example.com)
![Image alt text](https://example.com/image.jpg)

- Bullet point
- Another point

1. Numbered list
2. Second item

> Blockquote

`inline code`

```code block```
```

## SEO Features

### Automatic Generation
- **URL Slug**: Auto-generated from title (can be customized)
- **Meta Title**: Auto-generated from title (max 60 chars)
- **Excerpt**: Auto-generated from content (max 160 chars)

### Manual SEO Settings
- **Keywords**: Add relevant keywords for search optimization
- **Meta Description**: Custom description for search results
- **Featured Image**: Add image URL for social sharing
- **Tags**: Add tags for content organization

## Publishing Workflow

1. **Draft Status**: Posts start as drafts (not visible publicly)
2. **Review**: Use the preview feature to check formatting
3. **SEO Check**: Ensure meta fields are optimized
4. **Publish**: Change status to "Published" and save

## Image Management

Currently, images need to be hosted externally. Options:
1. Use a service like Imgur or Cloudinary
2. Upload to your own server
3. Use stock photo services with direct URLs

## Best Practices

### Content Structure
- Start with an engaging introduction
- Use headings to break up content
- Include relevant internal links
- Add a conclusion with a call-to-action

### SEO Optimization
- Keep titles under 60 characters
- Write compelling meta descriptions
- Use 3-5 relevant keywords
- Link to related job sectors

### Engagement
- Use templates as starting points
- Include data and statistics
- Add expert quotes when possible
- Keep content scannable with bullet points

## Database Setup

Before using the CMS, ensure the blog tables are created in Supabase:

```sql
-- Run the script at scripts/create-blog-schema.sql
```

## Environment Variables

Add to your `.env.local`:
```
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

## Future Enhancements

Planned features:
- Rich text editor option
- Direct image upload
- Author management
- Comment system
- Analytics integration