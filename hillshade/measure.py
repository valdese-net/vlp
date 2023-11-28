from haversine import haversine, inverse_haversine, Direction, Unit
import math
from maplib import *
import json

with open('ncCountyBounds.json') as nccbFile:
    nccb = json.load(nccbFile)

gps = dict(
	VLP = (35.7695,-81.5518),
	Boone = (36.2177,-81.6916),
	Asheville = (35.5859,-82.5623),
	Marion = (35.6796,-82.0047),
	Hickory = (35.7287,-81.3428)
)

for l in gps:
	print('%s: %d Miles' % (l,haversine(gps['VLP'],gps[l],unit=Unit.MILES)))

# all of these coords fall in xy of (275,403) at zoom 10
gps_xy_275_403 = [
    [35.7108,-83.3025],[35.7108,-83.2640],[35.7120,-83.2104],[35.7108,-83.1555],[35.7131,-83.1075],[35.7108,-83.0264],
	[35.7097,-83.0127],[35.4774,-82.9907],[35.5255,-83.0690],[35.5859,-83.1363],[35.6830,-83.2379]
]
for c in gps_xy_275_403:
      xy = MapTile.FromLatLon(c,10)
      if (not ((xy.x == 275) and (xy.y == 403))): print('Error: (%f,%f): (%d,%d)' % (c[0],c[1],xy.x,xy.y))

for c in nccb:
      print('%s: %d coordinates' % (c,len(nccb[c])))

targetLL = [[35.5,-83],[36.0,-81]]
tilerange = {}
for z in range(8,18):
      tile1 = MapTile.FromLatLon(targetLL[0],z)
      tile2 = MapTile.FromLatLon(targetLL[1],z)
      print('%d: %s tiles' % (z, '{:,}'.format((abs(tile1.x-tile2.x)+1)*(abs(1+tile1.y-tile2.y)+1))))
      tilerange[z] = [[tile1.x,tile1.y],[tile2.x,tile2.y]]

print('tile range json')
print(json.dumps(tilerange))
