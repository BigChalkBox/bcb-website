from PIL import Image
import collections

img = Image.open('public/logo_new/BCB_logo.png')
img = img.convert('RGB')
colors = img.getcolors(maxcolors=1000000)
# sort by count
colors = sorted(colors, key=lambda x: x[0], reverse=True)
# find the first color that is definitely "green" (G > R and G > B by a margin)
for count, (r, g, b) in colors:
    if g > r + 10 and g > b + 10 and r < 100 and b < 100:
        print(f"#{r:02x}{g:02x}{b:02x}")
        break
