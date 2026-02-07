# Satellite Image Setup

To add the satellite view image to the map screen:

1. Save the satellite image from the third image you provided as `satellite-map.png`
2. Place it in the `assets/` folder
3. Update `screens/MapViewScreen.js` to use the image:

Replace this section:
```javascript
<View style={styles.satelliteImage}>
  <View style={styles.placeholderContent}>
    ...
  </View>
</View>
```

With:
```javascript
<Image
  source={require('../assets/satellite-map.png')}
  style={styles.satelliteImage}
  resizeMode="cover"
/>
```

The colored overlays for courts and parking lots will automatically appear on top of the image.

