# SEO Setup Guide for Profilio

## What We've Implemented

### ✅ Technical SEO
- **Enhanced metadata** with Open Graph and Twitter cards
- **Dynamic sitemap** that automatically includes all user profiles
- **robots.txt** file allowing search engine crawling
- **Structured data (JSON-LD)** for rich search results
- **Canonical URLs** to prevent duplicate content issues

### ✅ Content Optimization
- **Keyword-rich descriptions** for main pages
- **Profile-specific metadata** for each user's page
- **Social media previews** with proper images and descriptions

## Next Steps for Google Search Console

### 1. Get Your Verification Code
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://profilio.online`
3. Choose "HTML tag" verification method
4. Copy the verification code (looks like: `google-site-verification: google1234567890.html`)

### 2. Update Verification Files
Replace the placeholder in these files with your actual verification code:

**Option A: HTML Tag (Recommended)**
- Update `src/app/layout.tsx` - replace `'your-google-verification-code'` with your actual code

**Option B: HTML File**
- Update `public/google-verification.html` - replace `YOUR_VERIFICATION_CODE_HERE`

### 3. Submit Your Sitemap
1. In Google Search Console, go to "Sitemaps"
2. Submit: `https://profilio.online/sitemap.xml`
3. The sitemap will automatically include all user profiles

### 4. Request Indexing
1. Go to "URL Inspection" in Search Console
2. Enter your main URL: `https://profilio.online`
3. Click "Request Indexing"

## Additional SEO Tips

### Content Strategy
- **Blog posts** about social media tips (if you add a blog)
- **User testimonials** on the homepage
- **FAQ section** about link-in-bio tools

### Link Building
- Share your site on social media
- Ask friends to link to their profiles
- Submit to relevant directories

### Performance
- Your site should already be fast with Next.js
- Monitor Core Web Vitals in Search Console

## Monitoring Progress

### Google Search Console Metrics to Watch
- **Index Coverage**: How many pages are indexed
- **Search Performance**: Clicks and impressions
- **Core Web Vitals**: Page speed metrics
- **Mobile Usability**: Mobile-friendly issues

### Expected Timeline
- **Immediate**: Sitemap submission and verification
- **1-2 weeks**: Initial indexing of main pages
- **2-4 weeks**: Profile pages start appearing
- **1-3 months**: Regular traffic from search

## Keywords to Target

### Primary Keywords
- "link in bio"
- "social media portfolio"
- "one link for all socials"
- "Instagram bio link"

### Long-tail Keywords
- "free link in bio tool"
- "social media links portfolio"
- "create social media landing page"

## Troubleshooting

### If Pages Don't Index
1. Check robots.txt isn't blocking
2. Verify no `noindex` meta tags
3. Ensure pages are accessible
4. Request indexing manually

### If Traffic is Low
1. Improve page titles and descriptions
2. Add more relevant content
3. Build quality backlinks
4. Optimize for user experience

## Files Created/Modified

- ✅ `src/app/layout.tsx` - Enhanced metadata
- ✅ `src/app/page.tsx` - Added structured data
- ✅ `src/app/[username]/page.tsx` - Profile page SEO
- ✅ `src/app/sitemap.ts` - Dynamic sitemap
- ✅ `public/robots.txt` - Search engine directives
- ✅ `public/google-verification.html` - Verification file

Your site is now optimized for search engines! The dynamic sitemap will automatically include new user profiles as they're created. 