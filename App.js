import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, Animated, TextInput, Alert, ViewPropTypes } from 'react-native';
//import { Button as ReactButton } from 'react-native-elements';
import { GestureHandler } from 'expo';

import styles from './styles';

const { LongPressGestureHandler, State, RectButton } = GestureHandler;
const SYMBOLS = ['÷', 'x', '-', '+'];

function normalizeNumber(number) {
  return String(number).replace(/\.$/, '');
}

function calculateResult(input) {
  if (input.length === 0) return '0';

  let result = parseFloat(input[0], 10);
  for (let i = 1; i < input.length - 1; i++) {
    const symbol = input[i];
    const number = input[i + 1];
    if (!number) break;

    const numberFloat = parseFloat(number, 10);

    if (symbol === '+') {
      result += numberFloat;
    } else if (symbol === 'x') {
      result *= numberFloat;
    } else if (symbol === '-') {
      result -= numberFloat;
    } else if (symbol === '÷') {
      result /= numberFloat;
    }
  }
  return String(result);
}

// class Button extends React.Component {
//   onPress = () => {
//     this.props.onPress(this.props.title);
//   }

//   render() {
//     const {
//       dark, containerViewStyle, buttonStyle, fontSize, ...rest
//     } = this.props;

//     return (
//       <ReactButton
//         containerViewStyle={[styles.buttonContainer, containerViewStyle]}
//         buttonStyle={[styles.button, dark ? styles.buttonDark : undefined, buttonStyle]}
//         fontSize={fontSize || 30}
//         {...rest}
//         onPress={this.onPress}
//       />
//     );
//   }
// }

class Button extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    dark: PropTypes.bool,
    longPressMinDuration: PropTypes.number,
    containerStyle: ViewPropTypes.style,
    buttonStyle: ViewPropTypes.style,
    textStyle: ViewPropTypes.style,

    onPress: PropTypes.func,
    onLongPressStarted: PropTypes.func,
    onLongPressCancelled: PropTypes.func,
    onLongPressEnd: PropTypes.func,
    onLongPress: PropTypes.func, // alias for onLongPressEnd
  };

  static defaultProps = {
    title: '',
    dark: false,
    longPressMinDuration: 500,
    containerStyle: undefined,
    buttonStyle: undefined,
    textStyle: undefined,

    onPress: () => {},
    onLongPressStarted: () => {},
    onLongPressCancelled: () => {},
    onLongPressEnd: () => {},
    onLongPress: () => {},
  };

  onPress = () => {
    this.props.onPress(this.props.title);
  }

  onLongPressStateChange = (event) => {
    const { title } = this.props;
    switch (event.nativeEvent.state) {
      case State.ACTIVE:
        this.props.onLongPressStarted(title);
        break;
      case State.CANCELLED:
        this.props.onLongPressCancelled(title);
        break;
      case State.END:
        this.props.onLongPressEnd(title);
        this.props.onLongPress(title);
        break;
      default:
        break;
    }
  }

  render() {
    const {
      title, dark, longPressMinDuration,
      containerStyle, buttonStyle, textStyle,
    } = this.props;
    return (
      <View style={[styles.buttonContainer, containerStyle]}>
        <LongPressGestureHandler
          onHandlerStateChange={this.onLongPressStateChange}
          minDurationMs={longPressMinDuration}
        >
          <RectButton
            style={[styles.button, dark ? styles.buttonDark : undefined, buttonStyle]}
            onPress={this.onPress}
          >
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          </RectButton>
        </LongPressGestureHandler>
      </View>
    );
  }
}

export default class App extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      input: ['0'],
      screenOpacityAnim: new Animated.Value(1),
    };
  }

  handleNumber = (number) => {
    number = String(number);

    this.setState(state => {
      const lastInputItem = state.input[state.input.length - 1] || '';
      const lastIsSymbol = lastInputItem && SYMBOLS.indexOf(lastInputItem) !== -1;

      if (number === '.') {
        if (!lastInputItem || lastIsSymbol) {
          number = '0' + number;
        } else if (lastInputItem.indexOf('.') !== -1) {
          return {};
        }
      } else if (number === '0') {
        if (lastInputItem === '0') return {};
      }

      let newInput;
      if (lastIsSymbol) {
        // add new number after symbol
        newInput = [
          ...state.input,
          number,
        ];
      } else {
        // attach to existing number
        const newLastInputItem = (lastInputItem === '0' && number !== '.')
          ? number
          : lastInputItem + number;
        newInput = [
          ...state.input.slice(0, -1),
          newLastInputItem,
        ];
      }

      return {
        input: newInput,
      };
    });
  }

  handleSymbol = (symbol) => {
    this.setState(state => {
      if (state.input.length === 0) return {};

      const lastInputItem = state.input[state.input.length - 1];

      let newInput;
      if (SYMBOLS.indexOf(lastInputItem) !== -1) {
        // replace last symbol
        newInput = [
          ...state.input.slice(0, -1),
          symbol,
        ];
      } else {
        // add new symbol after number
        newInput = [
          ...state.input.slice(0, -1),
          normalizeNumber(lastInputItem),
          symbol,
        ];
      }

      return {
        input: newInput,
      };
    });
  }

  handleDelete = () => {
    this.setState(state => {
      const lastInputItem = state.input[state.input.length - 1];
      if (!lastInputItem) return {};

      let newInput;
      const newLastInputItem = lastInputItem.slice(0, -1);
      if (!newLastInputItem) {
        newInput = state.input.slice(0, -1);
      } else {
        newInput = [
          ...state.input.slice(0, -1),
          newLastInputItem,
        ];
      }

      if (newInput.length === 0) {
        newInput.push('0');
      }

      return {
        input: newInput,
      };
    });
  }

  handleReset = () => {
    return new Promise(resolve => {
      this.setState({
        input: ['0'],
      }, resolve);
    });
  }

  handleFinish = () => {
    this.setState(state => ({
      input: [calculateResult(state.input)],
    }));
  }

  startResetAnimation = () => {
    this.resetAnimation = Animated.timing(this.state.screenOpacityAnim, {
      toValue: 0,
      duration: 500,
    });
    this.resetAnimationFinished = false;
    this.resetAnimation.start(({ finished }) => {
      if (finished) {
        this.resetAnimationFinished = true;
      }
    });
  }

  cancelResetAnimation = () => {
    this.resetAnimation.stop();
    this.state.screenOpacityAnim.setValue(1);
  }

  finalizeResetAnimation = () => {
    if (this.resetAnimationFinished) {
      this.handleReset().then(() => {
        this.state.screenOpacityAnim.setValue(1);
      });
    } else {
      this.cancelResetAnimation();
    }
  }

  render() {
    const { screenOpacityAnim } = this.state;
    const inputString = this.state.input.join(' ');
    const result = calculateResult(this.state.input);
    const hideResult = normalizeNumber(inputString) === normalizeNumber(result);

    return (
      // Try setting `flexDirection` to `column`.
      <View style={styles.container}>
        <Animated.View style={[styles.screen, { opacity: screenOpacityAnim }]}>
          <TextInput
            style={[styles.screenText, styles.input]}
            editable={false}
            value={inputString}
          />
          <TextInput
            style={[styles.screenText, styles.result]}
            editable={false}
            value={hideResult ? '' : result}
          />
        </Animated.View>
        <View style={styles.keyboard}>
          <View style={styles.buttonsRow}>
            <View style={styles.separator} />
            <Button
              dark
              title="C"
              containerStyle={styles.deleteButtonContainer}
              buttonStyle={styles.buttonDark}
              onPress={this.handleDelete}
              onLongPressStarted={this.startResetAnimation}
              onLongPressCancelled={this.cancelResetAnimation}
              onLongPressEnd={this.finalizeResetAnimation}
            />
          </View>
          <View style={styles.buttonsRow}>
            <Button title="7" onPress={this.handleNumber} />
            <Button title="8" onPress={this.handleNumber} />
            <Button title="9" onPress={this.handleNumber} />
            <Button dark title="÷" onPress={this.handleSymbol} />
          </View>
          <View style={styles.buttonsRow}>
            <Button title="4" onPress={this.handleNumber} />
            <Button title="5" onPress={this.handleNumber} />
            <Button title="6" onPress={this.handleNumber} />
            <Button dark title="x" onPress={this.handleSymbol} />
          </View>
          <View style={styles.buttonsRow}>
            <Button title="1" onPress={this.handleNumber} />
            <Button title="2" onPress={this.handleNumber} />
            <Button title="3" onPress={this.handleNumber} />
            <Button dark title="-" onPress={this.handleSymbol} />
          </View>
          <View style={styles.buttonsRow}>
            <Button title="." onPress={this.handleNumber} />
            <Button title="0" onPress={this.handleNumber} />
            <Button dark title="=" onPress={this.handleFinish} />
            <Button dark title="+" onPress={this.handleSymbol} />
          </View>
        </View>
      </View>
    );
  }
}
