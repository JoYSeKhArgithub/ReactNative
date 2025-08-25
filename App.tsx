import { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

interface Todo {
  id: string;
  title: string;
  done: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    readTodo();
  }, []);

  const saveToStorage = async (data: Todo[]) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(data));
    } catch (error) {
      Alert.alert('Error saving todos');
    }
  };

  const readTodo = async () => {
    try {
      const storeTodos = await AsyncStorage.getItem('todos');
      if (storeTodos) {
        const parsed: Todo[] = JSON.parse(storeTodos);
        if (Array.isArray(parsed)) {
          setTodos(parsed);
        } else {
          await AsyncStorage.removeItem('todos');
          setTodos([]);
        }
      }
    } catch (error) {
      Alert.alert('Error reading todos');
    }
  };

  const createTodo = async () => {
    if (!newTodoTitle.trim()) return;

    const newTodo: Todo = {
      id: uuid.v4().toString(),
      title: newTodoTitle,
      done: false,
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await saveToStorage(updatedTodos);
    setNewTodoTitle('');
  };

  const toggleDone = async (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
    setTodos(updatedTodos);
    await saveToStorage(updatedTodos);
  };

  const deleteTodo = async (id: string) => {
    const filteredTodos = todos.filter((todo) => todo.id !== id);
    setTodos(filteredTodos);
    await saveToStorage(filteredTodos);
  };

  const saveEdit = async (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, title: editingTitle } : todo
    );
    setTodos(updatedTodos);
    await saveToStorage(updatedTodos);
    setEditingId(null);
    setEditingTitle('');
  };

  return (
    <>
      <StatusBar backgroundColor="#208AEC" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image
            style={styles.header_Logo}
            source={{
              uri:
                'https://blog.back4app.com/wp-content/uploads/2019/05/back4app-white-logo-500px.png',
            }}
          />
          <Text style={styles.textBold}>React Native Todo App</Text>
          <Text style={styles.textLast}>Product Creation App</Text>
        </View>

        <View style={styles.wrapper}>
          <View style={styles.flex_between}>
            <Text style={styles.header_text}>Todo List</Text>
            <TouchableOpacity
              style={styles.refreshButtonStyle}
              onPress={readTodo}
            >
              <Text style={styles.refresh_button}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.new_todo}>
            <TextInput
              placeholder="New Todo"
              value={newTodoTitle}
              onChangeText={(text) => setNewTodoTitle(text)}
              style={styles.todo_input}
            />
            <TouchableOpacity onPress={createTodo} style={styles.button_Add}>
              <Text style={{ fontWeight: 'bold', color: 'white' }}>ADD</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {todos.map((todo) => (
              <View key={todo.id}>
                <View style={styles.eachTodo}>
                  {editingId === todo.id ? (
                    <TextInput
                      style={[styles.todo_input, { flex: 1 }]}
                      value={editingTitle}
                      onChangeText={setEditingTitle}
                      autoFocus
                    />
                  ) : (
                    <Text
                      style={[
                        styles.text_content,
                        todo.done && styles.todo_text_done,
                      ]}
                    >
                      {todo.title}
                    </Text>
                  )}

                  <View style={styles.todo_button}>
                    {editingId === todo.id ? (
                      <TouchableOpacity onPress={() => saveEdit(todo.id)}>
                        <Text style={styles.doneToggle}>Save</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => toggleDone(todo.id)}>
                          <Text style={styles.doneToggle}>
                            {todo.done ? 'Undone' : 'Done'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingId(todo.id);
                            setEditingTitle(todo.title);
                          }}
                        >
                          <Text style={styles.edit}>Edit</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
                      <Text style={styles.close}>✖</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 78,
    backgroundColor: '#0090FF',
  },
  textBold: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#fff',
  },
  textLast: {
    fontSize: 20,
    color: '#fff',
  },
  header_Logo: {
    width: 190,
    height: 40,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header_text: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  refreshButtonStyle: {
    backgroundColor: '#0090FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refresh_button: {
    fontWeight: 'bold',
    color: '#fff',
  },
  flex_between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  todo_input: {
    flex: 1,
    borderColor: '#cccccc',
    borderRadius: 14,
    borderWidth: 2,
    marginRight: 10,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#e6e6e6ff',
  },
  button_Add: {
    backgroundColor: '#0090FF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  new_todo: {
    flexDirection: 'row',
    marginTop: 12,
  },
  eachTodo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 23,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  text_content: {
    fontSize: 20,
    flex: 1,
  },
  todo_text_done: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  todo_button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doneToggle: {
    color: '#009688',
    fontWeight: 'bold',
    marginRight: 10,
  },
  edit: {
    color: '#ff9800',
    fontWeight: 'bold',
    marginRight: 10,
  },
  close: {
    color: '#ef5350',
    fontSize: 18,
  },
});

export default App;
