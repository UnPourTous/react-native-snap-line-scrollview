/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
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
import { DatePicker } from './library'
import SnapLineScrollView from './library/SnapLineScrollView'

type Props = {};
const {height, width} = Dimensions.get('window')
const blockHeight = 500

const totalHeight = height + 500
const maxOffsetY = totalHeight - height
const throttle = 150
export default class App extends Component<Props> {
  constructor () {
    super(...arguments)
    this.state = {
      offsetY: new Animated.Value(0),
      containerOffsetY: 0
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
  }

  onStartShouldSetPanResponder (e, gestureState) {
    console.log('onStartShouldSetPanResponder', this.scrollViewContentOffsetY, this.scrollViewContentOffsetY <= 5)
    this.startPoint = e.nativeEvent

    if (this.isAtBottom()) {
      this.isStartFromBottom = true
    } else {
      this.isStartFromBottom = false
    }
    if (this.isAtTop()) {
      this.isStartFromTop = true
    } else {
      this.isStartFromTop = false
    }
    return false

    // if (this.scrollViewContentOffsetY <= 5) {
    //   return true
    // } else {
    //   return false
    // }
  }

  onStartShouldSetPanResponderCapture (e, gestureState) {
    console.log('onStartShouldSetPanResponderCapture', e.nativeEvent, this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, gestureState)
    this.startPoint = e.nativeEvent
    return false
  }

  onMoveShouldSetPanResponder (e, gestureState) {
    console.log('onMoveShouldSetPanResponder', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1)
    // if (this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1 && (this.startPoint && this.startPoint.pageY < topAreaHeight)) {
    if ((this.isAtBottom() && this.isMovingUp(e, gestureState)) ||
      (this.isAtTop() && this.isMovingDown(e, gestureState))) {
      return true
    } else {
      return false
    }
  }

  onMoveShouldSetPanResponderCapture (e, gestureState) {
    console.log('onMoveShouldSetPanResponderCapture', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1)
    // 部分手机点击的时候，会返回一个很小的值例如0.5，如果这里拦截，会导致点击无效
    return false
    // if (this.isStartFromBottom) {
    //   return true
    // } else {
    //   return false
    // }
  }

  // if the content scroll value is at 0, we allow for a pull to refresh
  onPanResponderMove (e, gestureState) {
    // console.log('onPanResponderMove', e.nativeEvent, this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, gestureState.moveY > 0 && gestureState.dy > 1)
    console.log('onPanResponderMove', gestureState.dy)
    if (this.isStartFromBottom && this.isMovingUp(e, gestureState)) {
      this.state.offsetY.setValue(gestureState.dy)
    }

    if (this.isStartFromTop && this.isMovingDown(e, gestureState)) {
      this.state.offsetY.setValue(-height + gestureState.dy)
    }
  }

  onPanResponderTerminationRequest (e, gestureState) {
    console.log('onPanResponderTerminationRequest', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy)
    return false

  onPanResponderTerminate (e, gestureState) {
    console.log('onPanResponderTerminate', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy)
    this.onPanResponderRelease(e, gestureState)
  }

  onPanResponderRelease (e, gestureState) {
    // what to do when end
    if (this.isStartFromBottom && this.isMovingUp(e, gestureState)) {
      if (Math.abs(gestureState.dy) > throttle) {
        Animated.timing(this.state.offsetY, {
          toValue: -height,
          duration: 300
        }).start(() => {

        })
      } else {
        Animated.timing(this.state.offsetY, {
          toValue: 0,
          duration: 300
        }).start()
      }
    }

    if (this.isStartFromTop && this.isMovingDown(e, gestureState)) {
      if (Math.abs(gestureState.dy) > throttle) {
        Animated.timing(this.state.offsetY, {
          toValue: 0,
          duration: 300
        }).start()
        this.scrollViewContentOffsetY = maxOffsetY
      } else {
        Animated.timing(this.state.offsetY, {
          toValue: -height,
          duration: 300
        }).start()
      }
    }
    this.isStartFromBottom = false
    this.isStartFromTop = false
    this.scrollViewContentOffsetY = 0
    // console.log('onPanResponderRelease', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy)
    // // this.state.animatedValue.addListener
    // const back = () => {
    //   Animated.spring(this.state.animatedValue, {
    //     toValue: 1,
    //     duration: 300
    //   }).start(() => {
    //     this.state.animatedValue.setValue(0)
    //     this.scrollViewContentOffsetY = 0
    //   })
    // }
    // if (this.scrollViewContentOffsetY <= -pullRefreshIndicatorHeight) {
    //   this.props.onRefresh().then(back, back)
    // } else {
    //   back()
    // }
  }

  /**
   *  check if at bottom, if it is, capture the move up event
   */
  isAtBottom (e) {
    return this.scrollViewContentOffsetY >= maxOffsetY
  }

  /**
   *  check if at bottom, if it is, capture the move down event
   */
  isAtTop () {
    return this.scrollViewContentOffsetY <= 0
  }

  isMovingUp (e, gestureState) {
    return gestureState.moveY > 0 && gestureState.dy < -1
  }

  isMovingDown (e, gestureState) {
    return gestureState.moveY > 0 && gestureState.dy > 1
  }

  render () {
    return <Animated.View
      {...(this._panResponder ? this._panResponder.panHandlers : {})}
      style={{
        height: height * 2,
        transform: [
          {translateY: this.state.offsetY}
        ],
      }}>
      {[<View style={{
        height: totalHeight,
        backgroundColor: 'green',
      }}>
        <Text>Page 1</Text>
      </View>, <View style={{
        height: totalHeight,
        backgroundColor: 'blue',
      }}>
        <Text>Page 2</Text>
      </View>].map((item, index) => {
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
          {item}
        </ScrollView>
      })}
    </Animated.View>
  }

  render2 () {
    return (
      <SnapLineScrollView
        throttle={100}
        snapLineList={[blockHeight, blockHeight * 3]}>
        <View style={{flex: 1, alignSelf: 'stretch'}}>
          <View style={{
            backgroundColor: 'red',
            height: blockHeight,
            alignSelf: 'stretch'
          }}>
          </View>
          <View style={{
            backgroundColor: 'blue',
            height: blockHeight * 2,
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

