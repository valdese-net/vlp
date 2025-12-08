# Shapefile to GeoJSON

The park map needed a flexible way of showing the park boundary.
When reviewing Burke GIS data, the boundary shows as a complex
series of points, so it seemed best to acquire the actual parcel
boundary data.

NC State publishes per county GIS data at:
https://www.lib.ncsu.edu/gis/counties.html

This led to the parcel data linked in the `index.html` file.

Special thanks to Calvin Metcalf that made extraction of parcel
data possible via the `shapefile-js` library:
https://github.com/calvinmetcalf/shapefile-js

node bin/shp2geojson.mjs ~/dev/mktiles/data/parcels/nc_burke_parcels_poly.shp ~/dev/mktiles/data/parcels/nc_burke_parcels_poly.dbf > out/parcels.geojson
node bin/shp2geojson.mjs ~/dev/mktiles/data/parcels/nc_burke_parcels_poly.shp > out/plain-parcels.geojson

## Survey Data

Marks are documented as Heading and Distance. Headings are expressed using
degrees, arcminutes and arcseconds. Arcminutes and arcseconds are expressed
using the prime (′) and double-prime (″) characters, respectively, although
a single-quote and double-quote are often used for convenience. One arcminute
is equal to 1/60th of a degree, and one arcsecond is equal to 1/60th of an
arcminute:

Decimal_Degrees = D + arcmin/60 + arcsec/3600

