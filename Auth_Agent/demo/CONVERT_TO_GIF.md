# Converting Demo Videos to GIFs

GitHub READMEs support inline GIF display, but not video files. Convert your `.mp4` files to GIFs for better README presentation.

## Option 1: Using EZGIF (Easiest - Web Based)

1. Go to https://ezgif.com/video-to-gif
2. Upload your `.mp4` file
3. Click "Convert to GIF"
4. Adjust settings if needed (lower FPS/size for smaller files)
5. Click "Save" to download
6. Rename and place in `demo/` folder:
   - `browser-use-demo.gif`
   - `ecommerce-demo.gif`
   - `crypto-demo.gif`
   - `github-clone-demo.gif`

## Option 2: Using ffmpeg (Command Line)

```bash
cd demo

# Convert with optimized settings (smaller file size)
ffmpeg -i "Built-in Retina Display 2025-11-01 11:14:12.mp4" \
  -vf "fps=10,scale=800:-1:flags=lanczos" \
  -c:v gif \
  browser-use-demo.gif

ffmpeg -i "Built-in Retina Display 2025-11-01 12:08:45.mp4" \
  -vf "fps=10,scale=800:-1:flags=lanczos" \
  -c:v gif \
  ecommerce-demo.gif

ffmpeg -i "Built-in Retina Display 2025-11-01 12:31:36.mp4" \
  -vf "fps=10,scale=800:-1:flags=lanczos" \
  -c:v gif \
  crypto-demo.gif

ffmpeg -i "Built-in Retina Display 2025-11-01 12:40:05.mp4" \
  -vf "fps=10,scale=800:-1:flags=lanczos" \
  -c:v gif \
  github-clone-demo.gif
```

**ffmpeg parameters explained:**
- `fps=10` - Reduces frame rate (smaller file, smoother)
- `scale=800:-1` - Width 800px, height auto (maintains aspect ratio)
- `flags=lanczos` - High-quality scaling algorithm

## Option 3: Upload to YouTube (Alternative)

If videos are too large for GIFs:

1. Upload videos to YouTube
2. Get thumbnail URLs: `https://img.youtube.com/vi/VIDEO_ID/0.jpg`
3. Update README with:

```markdown
[![Watch Demo on YouTube](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)
```

## Tips for Smaller GIFs

- Keep duration short (10-30 seconds max)
- Lower frame rate (10-15 fps is usually enough)
- Reduce resolution (800px width is good for README)
- Crop to important parts only
- Use compression tools if file is still too large

## Expected File Sizes

- Short demo (10-15 seconds): 2-5 MB
- Medium demo (20-30 seconds): 5-10 MB
- Long demo (30+ seconds): Consider YouTube instead

GitHub has no hard limit, but smaller files load faster for viewers.

## After Conversion

Once you have your GIF files:

1. **Place them in the `demo/` folder** with these exact names:
   - `browser-use-demo.gif`
   - `ecommerce-demo.gif`
   - `crypto-demo.gif`
   - `github-clone-demo.gif`

2. **Commit them to the repository:**
   ```bash
   git add demo/*.gif
   git commit -m "Add demo GIFs for README"
   git push
   ```

3. **The README will automatically display them** using the relative paths already set up.

**Note:** Unlike browser-use's temporary signed URLs, committing GIFs directly to the repo ensures they never expire and load reliably.

