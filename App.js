/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  View,
  WebView,
  Dimensions,
  ScrollView
} from 'react-native'
import { DatePicker } from './library'
import { PopupStub } from '@unpourtous/react-native-popup-stub'
import moment from 'moment'
import SnapLineScrollView from './library/SnapLineScrollView'

type Props = {};
const {height, width} = Dimensions.get('window')
const blockHeight = 900
export default class App extends Component<Props> {
  render () {
    return (
      <SnapLineScrollView
        throttle={100}
        snapLineList={[0, blockHeight, blockHeight * 2]}>
        <View style={{flex: 1, alignSelf: 'stretch'}}>
          <View style={{
            backgroundColor: 'red',
            height: blockHeight,
            alignSelf: 'stretch'
          }}>
          </View>
          <View style={{
            backgroundColor: 'blue',
            height: blockHeight,
            alignSelf: 'stretch'
          }}>
          </View>

          <View style={{
            backgroundColor: 'green',
            height: blockHeight,
            alignSelf: 'stretch'
          }}>
          </View>
        </View>
      </SnapLineScrollView>
    )
  }
}

