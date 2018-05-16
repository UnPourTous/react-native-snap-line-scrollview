/**
 * Created by erichua on 16/05/2018.
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder
} from 'react-native'

const {height, width} = Dimensions.get('window')
const throttle = 150
const duration = 300
export default class  extends Component {
  static propTypes = {}

  constructor () {
    super(...arguments)
    this.state = {
      offsetY: new Animated.Value(0),
    }
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder.bind(this),
      onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture.bind(this),
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder.bind(this),
      onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture.bind(this),
      onPanResponderMove: this.onPanResponderMove.bind(this),
      onPanResponderRelease: this.onPanResponderTerminate.bind(this),
      onPanResponderTerminate: this.onPanResponderRelease.bind(this),
      onPanResponderTerminationRequest: this.onPanResponderTerminationRequest.bind(this)
    })

    this.isStartFromBottom = false
    this.isStartFromTop = false
    this.focusPageIndex = 0

    this.maxOffsetY = []
    this.pageHeight = []
  }

  render () {
    return <Animated.View
      {...(this._panResponder ? this._panResponder.panHandlers : {})}
      style={{
        transform: [
          {translateY: this.state.offsetY}
        ],
      }}>
      {React.Children.map(this.props.children, (item, index) => {
        return <ScrollView
          key={'key' + index}
          style={{
            height: height
          }}
          scrollEventThrottle={16}
          onScroll={(e) => {
            this.scrollViewContentOffsetY = e.nativeEvent.contentOffset.y
          }}
          alwaysBounceVertical={false}
          bounces={false}>
          <View
            onLayout={(e) => {
              this.maxOffsetY[index] = e.nativeEvent.layout.height - height
              this.pageHeight[index] = e.nativeEvent.layout.height
            }}>
            {item}
          </View>
        </ScrollView>
      })}

    </Animated.View>
  }

  onStartShouldSetPanResponder (e) {
    console.log('onStartShouldSetPanResponder', this.scrollViewContentOffsetY, this.scrollViewContentOffsetY <= 5)

    this.isStartFromBottom = !!this.isAtBottom()
    this.isStartFromTop = !!this.isAtTop()
    return false
  }

  onStartShouldSetPanResponderCapture (e, gestureState) {
    console.log('onStartShouldSetPanResponderCapture', e.nativeEvent, this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, gestureState)
    return false
  }

  onMoveShouldSetPanResponder (e, gestureState) {
    console.log('onMoveShouldSetPanResponder', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1)
    // if (this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1 && (this.startPoint && this.startPoint.pageY < topAreaHeight)) {
    return !!((this.isAtBottom() && this.isMovingUp(e, gestureState)) ||
      (this.isAtTop() && this.isMovingDown(e, gestureState)));
  }

  onMoveShouldSetPanResponderCapture (e, gestureState) {
    console.log('onMoveShouldSetPanResponderCapture', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1)
    return false
  }

  // if the content scroll value is at 0, we allow for a pull to refresh
  onPanResponderMove (e, gestureState) {
    console.log('onPanResponderMove', e.nativeEvent, this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, gestureState.moveY > 0 && gestureState.dy > 1)
    if (this.isStartFromBottom && this.isMovingUp(e, gestureState)) {
      let pageOffsetHeight = 0
      for (let i = 0; i < this.focusPageIndex; i++) {
        pageOffsetHeight += height
      }
      this.state.offsetY.setValue(gestureState.dy - pageOffsetHeight)
    }

    if (this.isStartFromTop && this.isMovingDown(e, gestureState)) {
      let pageOffsetHeight = 0
      for (let i = 0; i < this.focusPageIndex; i++) {
        pageOffsetHeight += height
      }
      this.state.offsetY.setValue(gestureState.dy - pageOffsetHeight)
    }
  }

  onPanResponderTerminationRequest (e, gestureState) {
    console.log('onPanResponderTerminationRequest', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy)
    return false
  }

  onPanResponderTerminate (e, gestureState) {
    console.log('onPanResponderTerminate', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy)
    this.onPanResponderRelease(e, gestureState)
  }

  onPanResponderRelease (e, gestureState) {
    // what to do when end
    if (this.isStartFromBottom && this.isMovingUp(e, gestureState)) {
      // 跳到下一页
      if (Math.abs(gestureState.dy) > throttle) {
        let newFocusPageIndex = this.focusPageIndex + 1
        Animated.timing(this.state.offsetY, {
          toValue: newFocusPageIndex * -height,
          duration
        }).start(() => {
          this.focusPageIndex = newFocusPageIndex
          this.scrollViewContentOffsetY = 0
        })
      } else {
        Animated.timing(this.state.offsetY, {
          toValue: this.focusPageIndex * -height,
          duration
        }).start()
      }
    }

    if (this.isStartFromTop && this.isMovingDown(e, gestureState)) {
      if (Math.abs(gestureState.dy) > throttle) {
        // 跳到上一页
        let newFocusPageIndex = this.focusPageIndex - 1
        Animated.timing(this.state.offsetY, {
          toValue: newFocusPageIndex * -height,
          duration
        }).start(() => {
          this.focusPageIndex = newFocusPageIndex
          this.scrollViewContentOffsetY = this.maxOffsetY[this.focusPageIndex]
        })
      } else {
        // 回弹到第二页
        Animated.timing(this.state.offsetY, {
          toValue: this.focusPageIndex * -height,
          duration
        }).start()
      }
    }
    this.isStartFromBottom = false
    this.isStartFromTop = false
  }

  /**
   *  check if at bottom, if it is, capture the move up event
   */
  isAtBottom () {
    return this.scrollViewContentOffsetY >= this.maxOffsetY[this.focusPageIndex] && this.focusPageIndex < (this.props.children.length - 1)
  }

  /**
   *  check if at bottom, if it is, capture the move down event
   */
  isAtTop () {
    return this.scrollViewContentOffsetY <= 0 && this.focusPageIndex > 0
  }

  isMovingUp (e, gestureState) {
    return gestureState.moveY > 0 && gestureState.dy < -1
  }

  isMovingDown (e, gestureState) {
    return gestureState.moveY > 0 && gestureState.dy > 1
  }
}
