/**
 * Created by erichua on 2018/01/09.
 */
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import _ from 'lodash'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'

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
            let bottomNearestLineOffset = null

            // 查找最贴近底边的snapLine
            this.linePageOffsetList.forEach((offset, index) => {
              if (offset >= 0 && offset <= height) {
                if (bottomNearestLineOffset === null) {
                  bottomNearestLineOffset = offset
                  bottomNearestLine = snapLineList[index]
                } else if (height - bottomNearestLineOffset > height - offset) {
                  bottomNearestLineOffset = offset
                  bottomNearestLine = snapLineList[index]
                }
              }
            })

            if (bottomNearestLineOffset + throttle < height) {
              // 分割线上半部分
              this._scrollYBy(e, bottomNearestLineOffset)
            } else if (bottomNearestLineOffset + throttle >= height) {
              // 回弹
              this._scrollYBy(e, -(height - bottomNearestLineOffset))
            }
          } else {
            // 页面向下走, 分割线在上半部分，且超出阀值
            let topNearestLine
            let topNearestLineOffset = null

            // 查找最贴近底边的snapLine
            this.linePageOffsetList.forEach((offset, index) => {
              if (offset >= 0 && offset <= height) {
                if (topNearestLineOffset === null) {
                  topNearestLineOffset = offset
                  topNearestLine = snapLineList[index]
                } else if (topNearestLineOffset > offset) {
                  topNearestLineOffset = offset
                  topNearestLine = snapLineList[index]
                }
              }
            })

            if (topNearestLineOffset > throttle) {
              this._scrollYBy(e, -(height - topNearestLineOffset))
            } else if (topNearestLineOffset > 0 && topNearestLineOffset <= throttle) {
              // 回弹
              this._scrollYBy(e, topNearestLineOffset)
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

  _scrollYBy (e, y) {
    if (this.ref) {
      this.ref.scrollTo({
        y: (e.nativeEvent.contentOffset.y + y),
        animated: true
      })
    }
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
