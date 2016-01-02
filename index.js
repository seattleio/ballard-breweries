var extend = require('xtend')
var vdom = require('virtual-dom')
var createApp = require('virtual-app')
var createMap = require('virtual-leaflet')
var point = require('turf-point')

var breweries = require('./breweries.json')
var app = createApp(document.body, vdom)
var h = app.h

function modifier (action, state) {
  if (action.type === 'location:set') {
    return extend(state, { location: action.location })
  }
}

var actions = {
  setLocation: function (location) {
    app.store({ type: 'location:set', location: location })
  }
}

var render = app.start(modifier, {
  location: null,
  locations: breweries,
  geojson: {
    type: 'FeatureCollection',
    features: breweries.map(function (item) {
      if (item.latitude && item.longitude) {
        return point([item.longitude, item.latitude], item)
      } else {
        return false
      }
    })
  }
})

render(function (state) {
  console.log('RENDER STATE', state)
  var elements = [map(state.geojson)]

  if (state.location) {
    elements.push(h('.sidebar', location(state.location)))
  } else {
    elements.push(h('.sidebar', about()))
  }

  return h('.app', elements)
})

function location (location) {
  return h('.location', [
    h('h1', location.name),
    h('p.address', location.address),
    h('p.website', [
      h('a', { href: location.website }, location.website)
    ]),
    h('p.map', h('a', {
      target: '_blank',
      href: 'https://google.com/maps/place/' + location.latitude + ',' + location.longitude
    }, 'Google directions'))
  ])
}

function about () {
  return h('.about', [
    h('h1', 'Ballard Brewery Map'),
    h('p', 'This is a map of breweries in Ballard.'),
    h('p', 'Enjoy.')
  ])
}

function map (geojson) {
  return h('div#map', createMap(geojson, {
    zoom: 14,
    setView: true,
    center: [47.664, -122.372],
    onclick: function (e) {
      actions.setLocation(e.layer.feature.properties)
    }
  }))
}
