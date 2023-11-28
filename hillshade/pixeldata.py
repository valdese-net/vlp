import sys
from PIL import Image as PImage, ImageFilter, ImageOps

black = PImage.open(sys.argv[1])
pixdata = black.load()

encoded = '+/abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
# Loop through image data
for x in range(black.size[0]):
	for y in range(black.size[1]):
		c = pixdata[x, y][3]//4
		print('%s' % (encoded[c]),end='')
	print()
