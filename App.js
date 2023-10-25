import { Keyboard, StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { Header, Icon, Input, Button, ListItem } from '@rneui/themed';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [list, setList] = useState([]);

  const db = SQLite.openDatabase('shoppinglist.db')

  useEffect(() => {
    db.transaction(
      tx => {
        tx.executeSql('create table if not exists shoppinglist (id integer primary key not null, product text, amount text);');
      },
      null,
      updateList
    )
  }, []);

  const saveItem = () => {
    console.log('saveItem:', amount, product)
    if (amount ==='' || product === '') {
      Alert.alert('Täytä tuote ja määrä')
    } else (
      db.transaction(
        tx => {
          tx.executeSql('insert into shoppinglist (product, amount) values (?, ?);', [product, amount]);
        },
        null,
        updateList
      )
    )
  }

  const updateList = () => {
    console.log('updateList');
    db.transaction(
      tx => {
        tx.executeSql('select * from shoppinglist;', [], (_, { rows }) => {
          setList(rows._array);
          setProduct('');
          setAmount('');
          Keyboard.dismiss();
        });
      });
  }

  const deleteItem = (id) => {
    console.log('deleteItem:', id, list.find(item => item.id == id));
    db.transaction(
      tx => {
        tx.executeSql('delete from shoppinglist where id = ?;', [id]);
      },
      null,
      updateList
    )
  }
  

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'SHOPPING LIST', style: { color: '#fff' } }}
      />

      <View style={styles.inputsContainer} >
      <Input
        style={styles.input}
        placeholder='Type product here' label='Product'
        onChangeText={text => setProduct(text)} value={product}
      />
      <Input
        style={styles.input}
        placeholder='Type amount here' label='Amount'
        onChangeText={text => setAmount(text)} value={amount}
      />
      </View>

      <Button raised icon={{ name: 'save', color: 'white' }} containerStyle={styles.button} onPress={saveItem} title="Save" />
      <FlatList
        style={styles.list}
        data={list}
        ListHeaderComponent = {() => <Text style={styles.listHeader}>Contents</Text>}
        keyExtractor={(item) => String(item.id)}
        renderItem = {({ item, index }) => 
          <ListItem bottomDivider key={String(index)}>
            <ListItem.Content>
              <ListItem.Title>{item.product}</ListItem.Title>
              <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
            </ListItem.Content>
            <Icon type='material' name='delete' iconStyle="sharp" color="red" onPress={() => deleteItem(item.id)} />
          </ListItem>
        }
      ></FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 20
  }, 
  listHeader : {
    alignSelf: 'center'
  }, 
  button: {
    width: '75%'
  },
  list: {
    flex: 1,
    margin: 30,
    width: '75%'
  },
  inputsContainer: {
    width: '75%',
    alignItems: 'center',
    marginTop: 10
  }, 
  input: {
    fontSize: 16
  },
  link: {
    color: 'blue'
  }
});
