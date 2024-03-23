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
22 March Assessment:
	35.7730885,-81.5454218	35.7697974,-81.5523062	trail dozer 1
	35.7693578,-81.5518838	35.7697263,-81.551102	trail dozer 2
	35.7718136,-81.5473403	35.7725584,-81.5476136	trail dozer 3

Finished Trail:
	- 35.772052,-81.546155 to 35.7718084,-81.5512121
	- 35.7678463,-81.5560147 to 35.772539,-81.547592
Formerly Uncleared:
	- 35.7689761,-81.5550397 to 35.7713294,-81.5536836
	- 35.7694054,-81.5557085 to 35.7678582,-81.5562871 (Outer Loop/Rostan Creek)
Remaining work:
	- 35.7694083,-81.558203 to 35.7704002,-81.5579122

```bash
# work remaining
node bin/trail-segment.js src/biketrails/bike_TrailComplete.trail "35.7718136,-81.5473403" "35.7725584,-81.5476136" > src/biketrails/out.txt

# old uncleared section
node bin/trail-segment.js src/biketrails/bike_TrailComplete.trail "35.7689761,-81.5550397" "35.7705515,-81.5543454" > src/biketrails/out.txt
node bin/trail-segment.js src/biketrails/bike_TrailComplete.trail "35.7694054,-81.5557085" "35.7678582,-81.5562871" > src/biketrails/out.txt

# finished ends
node bin/trail-segment.js src/biketrails/bike_TrailComplete.trail "35.773843,-81.5458099" "35.7689811,-81.5550535" > src/biketrails/out.txt
node bin/trail-segment.js src/biketrails/bike_TrailComplete.trail "35.7678463,-81.5560147" "35.772539,-81.547592" > src/biketrails/out.txt

# flip loop (2nd trail) around after this split
node bin/trail-split.js src/biketrails/bike_TrailCorridor1.trail 35.772557 -81.547608 > src/biketrails/out.txt

node bin/trail-split.js src/biketrails/bike_TrailCorridor1.trail 35.772039 -81.546150 > src/biketrails/out.txt
node bin/trail-split.js src/biketrails/bike_TrailCorridor1.trail 35.771235 -81.551465 > src/biketrails/out.txt

node bin/trail-split.js src/biketrails/bike_TrailComplete.trail 35.7684861 -81.5551105 > src/biketrails/out.txt

node bin/trail-length.js src/biketrails/bike_RemainingCorridor.trail
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
