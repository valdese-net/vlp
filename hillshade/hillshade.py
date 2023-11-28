import sys
import math
import os
from osgeo import gdal, gdalconst
from PIL import Image as PImage, ImageFilter, ImageOps
from haversine import haversine, Unit
from maplib import *

# Usage:
# Args: z 
foldert = sys.argv[1]
z = int(sys.argv[2])
targetLL = [[35.5,-83],[36.0,-81]]
if z > 16: targetLL = [[35.7632, -81.5670], [35.7765, -81.54284]]
tile1 = MapTile.FromLatLon(targetLL[0],z)
tile2 = MapTile.FromLatLon(targetLL[1],z)
x1 = min(tile1.x,tile2.x)
x2 = max(tile1.x,tile2.x)
y1 = min(tile1.y,tile2.y)
y2 = max(tile1.y,tile2.y)

# makeAlphaChannelPNG:
def makeAlphaChannelPNG(fromFile:str,toFile:str):
	hillside = PImage.open(fromFile)
	gray = ImageOps.grayscale(hillside)
	neg = ImageOps.invert(gray)
	black = PImage.new('RGBA', hillside.size)
	black.putalpha(neg.split()[0])
	black.save(toFile, "png")

def makeTile(infile:str, outfile:str, tile:MapTile, emphasize:int=1):
	warpFile = outfile + '_1.tif'
	shadeFile = outfile + '_2.tif'

	tile2 = MapTile(tile.z,tile.x+1,tile.y+1)
	l1 = tile.LatLon()
	l2 = tile2.LatLon()
	lonlatRect = [min(l1[1], l2[1]),min(l1[0], l2[0]),max(l1[1], l2[1]),max(l1[0], l2[0])]
	ds = gdal.Open(infile, gdal.GA_ReadOnly)
	ds = gdal.Warp(warpFile,
		ds,dstSRS = "EPSG:3857",resampleAlg = "cubic",
		outputBounds = lonlatRect,
		outputBoundsSRS = "EPSG:4326",
		width = 256, height = 256
	)
	ds = gdal.DEMProcessing(shadeFile,ds,"hillshade",alg='Horn',zFactor=emphasize,computeEdges=True)
	ds = None
	os.remove(warpFile)
	makeAlphaChannelPNG(shadeFile,outfile)
	os.remove(shadeFile)

for x in range(x1,x2+1):
	d = './build/%s/%d/%d' % (foldert,z,x)
	if not os.path.exists(d): os.makedirs(d)

	for y in range(y1,y2+1):
		outf = './build/%s/%d/%d/%d.png' % (foldert,z,x,y)
		if os.path.exists(outf):
			print('skipped %d,%d' % (x,y))
		else:
			print('generating %d,%d' % (x,y))
			makeTile('../nc-1.hgt', outf, MapTile(z,x,y))

