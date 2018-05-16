/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  Dimensions
} from 'react-native'
import { DatePicker } from './library'
import PaginationScrollView from './library/PaginationScrollView'

type Props = {};
const {height} = Dimensions.get('window')
const totalHeight = height + 500
export default class App extends Component<Props> {
  constructor () {
    super(...arguments)
  }

  render () {

    return <PaginationScrollView>
      <View style={{
        height: totalHeight,
        backgroundColor: 'green',
      }}>
        <Text>Page 1</Text>
      </View>

      <View style={{
        height: totalHeight + 200,
        backgroundColor: 'blue',
      }}>
        <Text>Page 2</Text>
      </View>

      <View style={{
        height: totalHeight + 100,
        backgroundColor: 'yellow',
      }}>
        <Text>Page 2</Text>
      </View>
    </PaginationScrollView>
  }
}

