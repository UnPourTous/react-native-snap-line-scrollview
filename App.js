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

type Props = {};
const {height, width} = Dimensions.get('window')
const blockHeight = 600
export default class App extends Component<Props> {
  constructor () {
    super(...arguments)
    this.state = {}
    this.startPoint = null
    this.scrollDirection = ''
    this.throttle = 100
    this.snapLineList = [0, blockHeight, 1200]
  }

  render () {
    return (
      <ScrollView
        ref={(_ref) => {
          _ref && (this.ref = _ref)
        }}
        style={{flex: 1}}
        onScrollBeginDrag={(e) => {
          this.startPoint = e.nativeEvent
        }}
        onScroll={(e) => {
        }}
        onScrollEndDrag={(e) => {
          console.log(e.nativeEvent)
          this.linePageOffsetList = this.snapLineList.map(item => item - e.nativeEvent.contentOffset.y)

          if (e.nativeEvent.contentOffset.y - this.startPoint.contentOffset.y > 0) {
            // 页面向上走
            let bottomNearestLine
            let bottomNearestLineOffset

            // 查找最贴近底边的snapLine
            this.linePageOffsetList.forEach((offset, index) => {
              if (offset >= 0 && offset <= height) {
                if (bottomNearestLineOffset === undefined) {
                  bottomNearestLineOffset = offset
                  bottomNearestLine = this.snapLineList[index]
                } else if (height - bottomNearestLineOffset > height - offset) {
                  bottomNearestLineOffset = offset
                  bottomNearestLine = this.snapLineList[index]
                }
              }
            })

            if (bottomNearestLineOffset === undefined) {
              // 没有屏幕内的snapLine
            } else {
              const linePageOffset = bottomNearestLineOffset
              if (linePageOffset < height && linePageOffset > 0) {
                if (linePageOffset + this.throttle < height) {
                  // 分割线上半部分
                  this.ref.scrollTo({
                    y: bottomNearestLine,
                    animated: true
                  })
                } else if (linePageOffset + this.throttle >= height) {
                  this.ref.scrollTo({
                    y: (this.startPoint.contentOffset.y - (height - linePageOffset)),
                    animated: true
                  })
                }
              }
            }
          } else {
            // 页面向下走, 分割线在上半部分，且超出阀值
            let topNearestLine
            let topNearestLineOffset

            // 查找最贴近底边的snapLine
            this.linePageOffsetList.forEach((offset, index) => {
              if (offset >= 0 && offset <= height) {
                if (topNearestLineOffset === undefined) {
                  topNearestLineOffset = offset
                  topNearestLine = index > 0 ? this.snapLineList[index - 1] : 0
                } else if (topNearestLineOffset > offset) {
                  topNearestLineOffset = offset
                  topNearestLine = index > 0 ? this.snapLineList[index - 1] : 0
                }
              }
            })

            if (topNearestLineOffset > this.throttle) {
              // 分割线上半部分
              this.ref.scrollTo({
                y: topNearestLine,
                animated: true
              })
            } else if (this.linePageOffset > 0 && this.linePageOffset <= this.throttle) {
              this.ref.scrollTo({
                y: this.line,
                animated: true
              })
            }
          }
        }
        }
        scrollEventThrottle={16}
        // snapToAlignment={'start'}
        // snapToInterval={300}
        contentContainerStyle={styles.container}>
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
            {/*</View>*/}
            {/*<View style={{*/}
            {/*backgroundColor: 'yellow',*/}
            {/*height: 300,*/}
            {/*alignSelf: 'stretch'*/}
            {/*}}>*/}
            {/*</View>*/}
            {/*<View style={{*/}
            {/*backgroundColor: 'blue',*/}
            {/*height: 300,*/}
            {/*alignSelf: 'stretch'*/}
            {/*}}>*/}
            {/*</View>*/}
            {/*<View style={{*/}
            {/*backgroundColor: 'green',*/}
            {/*height: 300,*/}
            {/*alignSelf: 'stretch'*/}
            {/*}}>*/}
            {/*</View>*/}
            {/*<View style={{*/}
            {/*backgroundColor: 'yellow',*/}
            {/*height: 300,*/}
            {/*alignSelf: 'stretch'*/}
            {/*}}>*/}
            {/*</View>*/}
            {/*<View style={{*/}
            {/*backgroundColor: 'blue',*/}
            {/*height: 300,*/}
            {/*alignSelf: 'stretch'*/}
            {/*}}>*/}
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})
