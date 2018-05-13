/**
 * Created by erichua on 2018/01/09.
 */
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import _ from 'lodash'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'

const {height, width} = Dimensions.get('window')
export default class SnapLineScrollView extends Component {
  constructor () {
    super(...arguments)
    this.startPoint = {}
  }

  static propTypes = {
    snapLineList: PropTypes.array
  }

  static PropTypes = {
    onComplete: _.noop
  }

  render () {
    const {snapLineList = [], throttle = 100} = this.props
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
          this.linePageOffsetList = snapLineList.map(item => item - e.nativeEvent.contentOffset.y)

          if (e.nativeEvent.contentOffset.y - this.startPoint.contentOffset.y > 0) {
            // 页面向上走
            let bottomNearestLine
            let bottomNearestLineOffset

            // 查找最贴近底边的snapLine
            this.linePageOffsetList.forEach((offset, index) => {
              if (offset >= 0 && offset <= height) {
                if (bottomNearestLineOffset === undefined) {
                  bottomNearestLineOffset = offset
                  bottomNearestLine = snapLineList[index]
                } else if (height - bottomNearestLineOffset > height - offset) {
                  bottomNearestLineOffset = offset
                  bottomNearestLine = snapLineList[index]
                }
              }
            })

            if (bottomNearestLineOffset === undefined) {
              // 没有屏幕内的snapLine
            } else {
              const linePageOffset = bottomNearestLineOffset
              if (linePageOffset < height && linePageOffset > 0) {
                if (linePageOffset + throttle < height) {
                  // 分割线上半部分
                  this.ref.scrollTo({
                    y: bottomNearestLine,
                    animated: true
                  })
                } else if (linePageOffset + throttle >= height) {
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
                  topNearestLine = index > 0 ? snapLineList[index - 1] : 0
                } else if (topNearestLineOffset > offset) {
                  topNearestLineOffset = offset
                  topNearestLine = index > 0 ? snapLineList[index - 1] : 0
                }
              }
            })

            if (topNearestLineOffset > throttle) {
              // 分割线上半部分
              this.ref.scrollTo({
                y: topNearestLine,
                animated: true
              })
            } else if (topNearestLineOffset > 0 && topNearestLineOffset <= throttle) {
              this.ref.scrollTo({
                y: (e.nativeEvent.contentOffset.y + topNearestLineOffset),
                animated: true
              })
            }
          }
        }
        }
        scrollEventThrottle={16}
        contentContainerStyle={styles.container}>
        <View style={{flex: 1, alignSelf: 'stretch'}}>
          {this.props.children}
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
