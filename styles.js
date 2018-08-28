import { StyleSheet } from 'react-native';
import { Constants } from 'expo';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000000',
    paddingTop: Constants.statusBarHeight,
  },

  screen: {
    flexDirection: 'column',
  },

  screenText: {
    color: '#ffffff',
    textAlign: 'right',
  },

  input: {
    fontSize: 30,
  },

  keyboard: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#1A1A1A',
  },

  buttonsRow: {
    flex: 1,
    flexDirection: 'row',
  },

  separator: {
    flex: 1,
  },

  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 0,
    borderWidth: 1,
    borderColor: 'black',
  },

  deleteButtonContainer: {
    flex: 0,
    width: '25%',
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#474747',
    width: '100%',
    height: '100%',
  },

  buttonDark: {
    backgroundColor: '#1A1A1A',
  },

  buttonText: {
    color: 'white',
    fontSize: 30,
  },
});

export default styles;
