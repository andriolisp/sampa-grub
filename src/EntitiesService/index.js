var Tagger = require('./Tagger.js')
var _ = require('lodash')

var isNotEmpty = function (value) {
  return !_.isEmpty(value)
}

var EntitiesService = {}

EntitiesService.tag = function (request) {
  // return new Promise((resolve, reject) => {
  //   Tagger.tag(this.clean(request.message)).then((results) => {
  //     resolve(_.set(request, 'entities', results))
  //   })
  // })

  _.set(request, 'entities', {
    neighborhood: ['south end'],
    address: [],
    foodType: ['mexican'],
    restauraunt: []
  })
  var P = new Promise(function (resolve, reject) {
    resolve(request)
  })
  return P
}

EntitiesService.clean = function (text) {
  text = text.toLowerCase()
  text = text.replace(/[a-z]'[a-z]/g, '')
  text = text.replace(/[^\s\.\?\!a-z0-9]/g, ' ')
  text = text.replace(/\s+/g, ' ')
  text = text.replace(/[\.\?\!]+\s+/g, '.')
  text = text.replace(/^[\.\?\!]+/, '')
  text = text.replace(/[\.\?\!]+$/, '')

  return JSON.stringify(_.filter(text.split(/\./), isNotEmpty))
}

module.exports = EntitiesService

// Tagger.init().then(() => {
//   console.log('ready')
//   EntitiesService.tag({ message: 'with that said the ribs are the best' }).then((results) => {
//     console.log('results')
//     console.log(results)
//   })
// })
