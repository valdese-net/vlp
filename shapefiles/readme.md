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