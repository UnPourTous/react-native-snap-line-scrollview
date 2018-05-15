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

const {height: windowHeight} = Dimensions.get('window')
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
    return (
      <ScrollView
        onLayout={(e) => {
          console.log('onLayout ', e.nativeEvent)
          React.Children.forEach(this.props.children, (child) => {
            console.log(child)
          })
        }}
        ref={(_ref) => {
          console.log('ref ')
          _ref && (this.ref = _ref)
        }}
        style={{flex: 1}}
        onScrollBeginDrag={(e) => {
          this.startPoint = e.nativeEvent
        }}
        onScroll={(e) => {
        }}
        // onMomentumScrollEnd={(e) => this._onEnd(e)}
        onScrollEndDrag={e => this._onEnd(e)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.container}>
        <View
          onLayout={(e) => {
            console.log('container onLayout ', e.nativeEvent.layout)
            this.contentHeight = e.nativeEvent.layout.height
          }}
          style={{flex: 1, alignSelf: 'stretch'}}>
          {this.props.children}
        </View>
      </ScrollView>
    )
  }

  _scrollYBy (e, y) {
    if (this.ref) {
      let scollYTarget = e.nativeEvent.contentOffset.y + y
      if (scollYTarget < 0) {
        scollYTarget = 0
      }

      const {containerHeight = windowHeight} = this.props
      if (scollYTarget + containerHeight > this.contentHeight) {
        scollYTarget = this.contentHeight - containerHeight
      }
      this.ref.scrollTo({
        y: scollYTarget,
        animated: true
      })
    }
  }

  _onEnd (e) {
    this.ref.scrollTo({
      y: e.nativeEvent.contentOffset.y,
      animated: true
    })

    const {snapLineList = [], throttle = 100, containerHeight = windowHeight} = this.props
    this.linePageOffsetList = snapLineList.map(item => item - e.nativeEvent.contentOffset.y)

    if (e.nativeEvent.contentOffset.y - this.startPoint.contentOffset.y > 0) {
      // 页面向上走
      let bottomNearestLine
      let bottomNearestLineOffset = null

      // 查找最贴近底边的snapLine
      this.linePageOffsetList.forEach((offset, index) => {
        if (offset >= 0 && offset <= containerHeight) {
          if (bottomNearestLineOffset === null) {
            bottomNearestLineOffset = offset
            bottomNearestLine = snapLineList[index]
          } else if (containerHeight - bottomNearestLineOffset > containerHeight - offset) {
            bottomNearestLineOffset = offset
            bottomNearestLine = snapLineList[index]
          }
        }
      })

      if (bottomNearestLineOffset !== null) {
        if (bottomNearestLineOffset + throttle < containerHeight) {
          // 分割线上半部分
          this._scrollYBy(e, bottomNearestLineOffset)
        } else if (bottomNearestLineOffset + throttle >= containerHeight) {
          // 回弹
          this._scrollYBy(e, -(containerHeight - bottomNearestLineOffset))
        }
      }
    } else {
      // 页面向下走, 分割线在上半部分，且超出阀值
      let topNearestLine
      let topNearestLineOffset = null

      // 查找最贴近底边的snapLine
      this.linePageOffsetList.forEach((offset, index) => {
        if (offset >= 0 && offset <= containerHeight) {
          if (topNearestLineOffset === null) {
            topNearestLineOffset = offset
            topNearestLine = snapLineList[index]
          } else if (topNearestLineOffset > offset) {
            topNearestLineOffset = offset
            topNearestLine = snapLineList[index]
          }
        }
      })

      if (topNearestLineOffset !== null) {
        if (topNearestLineOffset > throttle) {
          this._scrollYBy(e, -(containerHeight - topNearestLineOffset))
        } else if (topNearestLineOffset > 0 && topNearestLineOffset <= throttle) {
          // 回弹
          this._scrollYBy(e, topNearestLineOffset)
        }
      }
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
