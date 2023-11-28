import math

class MapTile:
	def __init__(self,z=1,x:int=0,y:int=0):
		if (type(z) is int):
			self.z = z
			self.x = x
			self.y = y
		else:
			self.z = z.z
			self.x = z.x
			self.y = z.y

	@staticmethod
	def FromLatLon(latlon:tuple, z:int):
		z2 = 1 << z
		# Zoom level coordinates
		lon = ((latlon[1] + 180.0) % 360.0)
		lat  = max(min(float(latlon[0]), 89.9),-89.9)
		lat_rad = math.radians(lat)
		zl_x = lon / (360.0 / z2)
		zl_y = (z2 / 2) * (1.0 - (math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi))
		zl_x = math.floor(zl_x)
		zl_y = math.floor(zl_y)
		return MapTile(z, zl_x, zl_y)
	
	def LatLon(self)->tuple:
		res = (1 << self.z)
		def lat(y:int)->float:
			n = math.pi - ((2.0 * math.pi * float(y)) / res)
			return (180.0 / math.pi) * math.atan(0.5 * (math.exp(n) - math.exp(-1*n)))
		def lon(x:int)->float: return ((float(x) / res) * 360.0) - 180
		return (lat(self.y),lon(self.x))
