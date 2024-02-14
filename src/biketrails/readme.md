These are the trails converted from the file:

VLP_Trail_Segments_Update_11_23.kmz

The equipment that is believed to be involved in cutting in the trail:

https://www.youtube.com/watch?v=B8J1mdXSJ_8

Progress:
2 Feb:
	- 35.772052,-81.546155 to 35.772767,-81.547899
	- 35.771790,-81.547288 to 35.772539,-81.547592
3 Feb:
	- 35.772767,-81.547899 to 35.771235,-81.551465
	- 35.771207,-81.549372 to 35.771790,-81.547288
5 Feb:
	- 35.771504,-81.549621 to 35.771207,-81.549372
6 Feb:
	- 35.771337,-81.550323 to 35.771504,-81.549621
7 Feb:
	- fixed up Rhododendron area
8 Feb:
	- 35.771380,-81.550995 to 35.771337,-81.550323
9 Feb:
	- 35.768089,-81.553011 to 35.771380,-81.550995
10 Feb:
	- 35.7684861 -81.5551105 to 35.768089,-81.553011
13 Feb:
	- 35.7689811,-81.5550535 to 35.7692498,-81.5532276 (Mark Rostan)
	- 35.7684666,-81.5551439 to 35.7678463,-81.5560147 (Eric & Johnnie)

Finished Trail:
	- 35.772052,-81.546155 to 35.771235,-81.551465
	- 35.7678463,-81.5560147 to 35.772539,-81.547592

```bash
# marks section
node bin/trail-segment.js src/biketrails/bike_TrailComplete.trail "35.7689811,-81.5550535" "35.7692498,-81.5532276" > src/biketrails/out.txt
# finished end (corridor 2)
node bin/trail-segment.js src/biketrails/bike_TrailComplete.trail "35.7678463,-81.5560147" "35.772539,-81.547592" > src/biketrails/out.txt

# flip loop (2nd trail) around after this split
node bin/trail-split.js src/biketrails/bike_TrailCorridor1.trail 35.772557 -81.547608 > src/biketrails/out.txt

node bin/trail-split.js src/biketrails/bike_TrailCorridor1.trail 35.772039 -81.546150 > src/biketrails/out.txt
node bin/trail-split.js src/biketrails/bike_TrailCorridor1.trail 35.771235 -81.551465 > src/biketrails/out.txt

node bin/trail-split.js src/biketrails/bike_TrailComplete.trail 35.7684861 -81.5551105 > src/biketrails/out.txt

node bin/trail-length.js src/biketrails/bike_TrailCorridor1.trail
node bin/trail-length.js src/biketrails/bike_TrailCorridor2.trail
```

Appending trail segments:

```bash
node bin/trail-combine.js \
src/biketrails/bike_CWTF1.trail \
src/biketrails/bike_Primary1.trail \
src/biketrails/bike_CWTF2.trail \
src/biketrails/bike_Primary2.trail \
src/biketrails/bike_CWTF3.trail \
src/biketrails/bike_Primary3.trail \
src/biketrails/bike_CWTF4.trail \
src/biketrails/bike_Primary4.trail \
src/biketrails/bike_CWTF5.trail \
src/biketrails/bike_Primary5.trail \
src/biketrails/bike_CWTF6.trail \
src/biketrails/bike_Primary6.trail \
src/biketrails/bike_CWTF7.trail \
src/biketrails/bike_Primary7.trail \
> src/biketrails/bike_Loop.trail

node bin/trail-split.js \
src/biketrails/bike_Loop.trail \
35.772564 \
-81.547622 > src/biketrails/bike_Loop1.trail

node bin/trail-combine.js \
src/biketrails/bike_ConnectorC.trail \
src/biketrails/bike_Loop1.trail \
src/biketrails/bike_Loop2.trail \
> src/biketrails/bike_TrailComplete.trail
```
