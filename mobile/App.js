import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QuizContainer } from './components/VibeQuiz/QuizContainer';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QuizContainer />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
