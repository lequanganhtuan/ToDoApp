// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    console.log('Firestore DB:', q);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  const addTask = async () => {
    if (task.trim() === '') {
      Alert.alert('Error', 'Please enter a task');
      return;
    }
    try {
      await addDoc(collection(db, 'tasks'), {
        task: task,
        createdAt: new Date(),
      });
      setTask('');
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const updateTask = async (id) => {
    const taskToUpdate = tasks.find(item => item.id === id);
    if (!taskToUpdate) return;
    Alert.prompt(
      'Update Task',
      'Enter new task',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async (newTask) => {
            if (newTask.trim() === '') {
              Alert.alert('Error', 'Task cannot be empty');
              return;
            }
            try {
              const taskRef = doc(db, 'tasks', id);
              await updateDoc(taskRef, {
                task: newTask,
              });
            } catch (error) {
              console.error("Error updating task: ", error);
            }
          },
        },
      ],
      'plain-text',
      taskToUpdate.task
    );
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskText}>{item.task}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => updateTask(item.id)} style={styles.updateButton}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Thanh nhập công việc */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter task"
          value={task}
          onChangeText={text => setTask(text)}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      {/* Danh sách công việc */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  updateButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});
