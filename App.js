import { StatusBar } from 'expo-status-bar';
import { Component } from 'react';
import { Button, PermissionsAndroid, 
	Platform,
	StyleSheet, Text, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import PruebaPermiso from './PruebaPermiso';

class BLEScanner extends Component
{
	constructor(props)
	{
		super(props);
		this.blemanager = new BleManager();
		console.log(this.blemanager);
		this.state = {
			devices:[],
			granted:false
		};
	}

	async componentDidMount()
	{
		console.log("blescanner mount");
		if (Platform.OS === 'android' && Platform.Version >= 23)
		{
			/*
			await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, 
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT])
			.then( result=>{
				console.log('post permisos');
				console.log(result);
				if (result['android.permission.BLUETOOTH_CONNECT'] === 'granted'&&
					result['.android.permission.BLUETOOTH_SCAN']==='granted')
					{
						this.setState((prev)=>({
							granted:true
						}));
					}
				
			}).catch((err)=>{console.log(err)});
			*/
			await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN)
			.then( result => {
				console.log(result);
			}).catch((err)=>{console.log(err)});
		}

	}

	async prueba()
	{
		console.log('prueba');
		/*
		if (Platform.OS === 'android' && Platform.Version >= 23)
			{
				await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH)
				.then( result => {
					console.log(result);
				}).catch((err)=>{console.log(err)});
			}
		*/
		this.blemanager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log('Device found:', device.id, device.name);
            if (!this.state.devices.some((existingDevice) => existingDevice.id === device.id)) {
                this.setState((prevState) => ({
                    devices: [...prevState.devices, device],
                }));
            }
        });
	}

	render()
	{
		if(this.state.granted!==true)
			return( 
				<View>
				<Text>Se necesitan permisos para acceder al BluetoothLE</Text>
				<Button title='perm' onPress={this.prueba} />
				</View>
			);
		else return(
			<Text>Dispositivos encontrados:</Text>
		)
	}
}

export default function App() {
  return (
    <View style={styles.container}>
		<BLEScanner />
    </View>
  );
}
//<PruebaPermiso></PruebaPermiso>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
