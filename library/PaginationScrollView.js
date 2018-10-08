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
  PanResponder,
  Platform
} from 'react-native'

let {height: windownHeight} = Dimensions.get('window')
const throttle = Platform.select({android: 100, ios: 150})
const duration = 100
export default class extends Component {
  static propTypes = {}
  static defaultProps = {
    scrollWindowHeight: windownHeight
  }

  constructor () {
    super(...arguments)
    this.state = {
      offsetY: new Animated.Value(0),
    }

    let validChildrenNum = 0
    React.Children.forEach(this.props.children, (item) => {
      if (item === null) {
        console.log('React.Children.forEach null')
      } else {
        validChildrenNum++
      }
    })
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
    this.scrollViewRef = []
  }

  render () {
    const {scrollWindowHeight: height} = this.props

    let validChildrenNum = 0
    React.Children.forEach(this.props.children, (item) => {
      if (item === null) {
        console.log('React.Children.forEach null')
      } else {
        validChildrenNum++
      }
    })
    return <Animated.View
      {...(validChildrenNum > 1 ? this._panResponder.panHandlers : {})}
      style={[{
        transform: [
          {translateY: this.state.offsetY}
        ],
      }, this.props.style]}>
      {React.Children.map(this.props.children, (item, index) => {
        return <ScrollView
          ref={ref => {
            ref && (this.scrollViewRef[index] = ref)
          }}
          key={'key' + index}
          overScrollMode={'never'}
          style={{
            height: height,
            flex: 1
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

    this.isStartFromBottom = this.isAtBottom()
    this.isStartFromTop = this.isAtTop()
    return Platform.select({
      android: this.isStartFromBottom || this.isStartFromTop,
      ios: false
    })
  }

  onStartShouldSetPanResponderCapture (e, gestureState) {
    console.log('onStartShouldSetPanResponderCapture', e.nativeEvent, this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, gestureState)
    this.isStartFromBottom = this.isAtBottom()
    this.isStartFromTop = this.isAtTop()
    return Platform.select({
      // android: this.isStartFromBottom || this.isStartFromTop,
      android: false,
      ios: false
    })
  }

  onMoveShouldSetPanResponder (e, gestureState) {
    console.log('onMoveShouldSetPanResponder', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, ((this.isAtBottom() && this.isMovingUp(e, gestureState)) ||
      (this.isAtTop() && this.isMovingDown(e, gestureState))))
    // if (this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1 && (this.startPoint && this.startPoint.pageY < topAreaHeight)) {
    return ((this.isAtBottom() && this.isMovingUp(e, gestureState)) ||
      (this.isAtTop() && this.isMovingDown(e, gestureState)))
  }

  onMoveShouldSetPanResponderCapture (e, gestureState) {
    console.log('onMoveShouldSetPanResponderCapture', this.scrollViewContentOffsetY, gestureState.moveY, gestureState.y0, gestureState.dy, this.scrollViewContentOffsetY <= 5 && gestureState.dy > 1)
    console.log('onMoveShouldSetPanResponderCapture',
      gestureState.dy !== 0 &&
      ((this.isStartFromBottom && this.isMovingUp(e, gestureState)) ||
        (this.isStartFromTop && this.isMovingDown(e, gestureState))))
    return gestureState.dy !== 0 &&
      ((this.isStartFromBottom && this.isMovingUp(e, gestureState)) ||
        (this.isStartFromTop && this.isMovingDown(e, gestureState)))
  }

  // if the content scroll value is at 0, we allow for a pull to refresh
  onPanResponderMove (e, gestureState) {
    const {scrollWindowHeight: height} = this.props
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

    if (Platform.OS === 'android') {
      if (this.isStartFromBottom && this.isMovingDown(e, gestureState)) {
        this.scrollViewRef[this.focusPageIndex].scrollTo({
          y: this.pageHeight[this.focusPageIndex] - height - gestureState.dy,
          animated: false
        })
      }

      if (this.isStartFromTop && this.isMovingUp(e, gestureState)) {
        this.scrollViewRef[this.focusPageIndex].scrollTo({
          y: -gestureState.dy,
          animated: false
        })
      }
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
    const {scrollWindowHeight: height} = this.props
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
    return Math.abs(this.scrollViewContentOffsetY - this.maxOffsetY[this.focusPageIndex]) <= 1 &&
      this.focusPageIndex < (this.props.children.length - 1)
  }

  /**
   *  check if at bottom, if it is, capture the move down event
   */
  isAtTop () {
    return this.scrollViewContentOffsetY <= 5 && this.focusPageIndex > 0
  }

  isMovingUp (e, gestureState) {
    return gestureState.moveY > 0 && gestureState.dy < -1
  }

  isMovingDown (e, gestureState) {
    return gestureState.moveY > 0 && gestureState.dy > 1
  }
}