# Trails Definitions

These trails are typically created using a phone app like RunKeeper,
and then exported to a `gpx` file. COnversion to a `trail` file is
done via the `gpx2trail.js` command in the `bin` folder:

```bash
node bin/gpx2trail.js 5k-2022-synthesized.gpx > src/trails/5k-2022.trail
```

Create a `gpx` file using an editor, such as:

- https://gpx.studio/