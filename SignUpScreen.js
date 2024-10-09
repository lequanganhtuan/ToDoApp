import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; 

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Đăng ký thành công!");
      navigation.navigate('Login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={text => setPassword(text)}
        secureTextEntry
      />
      <Button title="Đăng ký" onPress={handleSignUp} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Text style={styles.switchText} onPress={() => navigation.navigate('Login')}>
        Đã có tài khoản? Đăng nhập
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  switchText: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SignUpScreen;
