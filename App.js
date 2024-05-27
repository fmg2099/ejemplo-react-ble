import { StatusBar } from 'expo-status-bar';
import { Component, 
	useEffect, 
	useState } from 'react';
import { Button, 
	PermissionsAndroid, 
	Platform,
	StyleSheet, 
	Text, 
	View, 
	TouchableHighlight,
	SafeAreaView,
	Animated } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import PruebaPermiso from './PruebaPermiso';
import DeviceInfo from 'react-native-device-info';

//Componente para escanear y desplegar dispositivos BLE cercanos.
//Usa la estrategia de class component
class BLEScanner extends Component
{
	constructor(props)
	{
		super(props);
		this.goma = 299;
		this.state = {
			devices:[],
			granted:false,
			showDeviceInfo:false,
			currentDevice:null,
			showLoading:false,
		};
		this.blemanager = new BleManager();
		this.componentDidMount = this.componentDidMount.bind(this);
		this.componentWillUnmount = this.componentWillUnmount.bind(this);
		this.toggleDeviceView = this.toggleDeviceView.bind(this);
	}

	async componentDidMount()
	{
		this.startScan();
	}

	startScan()
	{
		//asume que ya se pidieron permisos
		this.setState((prevState)=>({devices:[]}));
		this.blemanager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error(error);
                return;
            }
            //console.log('Device found:', device.id, device.name);
			//si no existe ya el id del device, agregarlo
            if (!this.state.devices.some((existingDevice) => existingDevice.id === device.id)) 
			{
                this.setState((prevState) => ({
                    devices: [...prevState.devices, device],
                }));
            }
        });
	}

	componentWillUnmount()
	{
		console.log('BLEScanner unmount');
		//this.blemanager.destroy();
	}

	toggleDeviceView( deviceIndex )
	{
		if(deviceIndex===undefined)
		{
			this.setState( (prev) => ({
				...prev,
				showDeviceInfo:false,
				showLoading:false
			}));
			this.startScan();
		}
		else
		{
			this.setState( (prev) => ({
				...prev,
				showLoading:true
			}));
			this.blemanager.stopDeviceScan();
			console.log('conectando...');
			triedDevice = this.state.devices[deviceIndex];
			triedDevice.connect()
			.then(connectedDevice => {
				console.log('obteniendo services y characteristics...')
				return connectedDevice.discoverAllServicesAndCharacteristics()
			})
			.then( (device) =>  {
				console.log('Conectado a device ',device.id);
				device.services().then((services)=>
				{
					console.log('Services: ', services);
					services.forEach(service => {
						console.log('Service UUID:', service.uuid);
						service.characteristics().then( characs => {
							characs.forEach(charac => {
								console.log("Characteristic: ", charac.uuid);
							});
						});
					});
				}).catch(error => {console.log('error al obtener services: ', error)} );


				//para actualizar el UI
				this.setState( (prev) => ({
					...prev,
					currentDevice:device,
					showDeviceInfo:true,
					showLoading:false
				}));

			})
			.catch( error =>{
				console.log("no se pudo conectar: ",error);
				this.startScan();
			})
			
		}	
	}

	render()
	{
		return( 
			<View style={{flex:1, width:'100%'}}>
			{/*panel de lista de escaneados*/}
				<View style={styles.content}>
					<Text style={styles.subtitle}>Dispositivos encontrados:</Text>
					{this.state.devices.map( (device, i)=> (
						<TouchableHighlight
							onPress={ ()=> this.toggleDeviceView(i) } 
							style={styles.cell} 
							key={device.id}>
							<Text style={styles.cellText}>{device.name||device.id}</Text>
						</TouchableHighlight>
					))}
				</View>
			{/*panel de deviceInfo*/}
				{this.state.showDeviceInfo &&
				(<View style={styles.deviceInfo}>
					<Text style={styles.subtitle}>Devide Info</Text>
					<Text style={styles.deviceInfoCloseButton}
						onPress={ ()=>this.toggleDeviceView()}>❌</Text>
					{/*tabla con datos*/}
					<View style={styles.deviceInfoRow}>
						<View style={styles.deviceInfoLabel}>
							<Text>Address:</Text>
						</View>
						<View style={styles.deviceInfoDatum}>
							<Text>{this.state.currentDevice.id}</Text>
						</View>
					</View>		
					<View style={styles.deviceInfoRow}>
						<View style={styles.deviceInfoLabel}>
							<Text>Name:</Text>
						</View>
						<View style={styles.deviceInfoDatum}>
							<Text>{this.state.currentDevice.name}</Text>
						</View>
					</View>
					<View style={styles.deviceInfoRow}>
						<View style={styles.deviceInfoLabel}>
							<Text>rssi:</Text>
						</View>
						<View style={styles.deviceInfoDatum}>
							<Text>{this.state.currentDevice.rssi}</Text>
						</View>
					</View>
					<View style={styles.deviceInfoRow}>
						<View style={styles.deviceInfoLabel}>
							<Text>localName:</Text>
						</View>
						<View style={styles.deviceInfoDatum}>
							<Text>{this.state.currentDevice.localName}</Text>
						</View>
					</View>
					
					{/*this.state.currentDevice.serviceUUIDs.map( (service, i)=> (
						<Text key={service} >{service}</Text>
					)
					)*/}
				</View>)
				}
			{/*panel de loading*/}
				{this.state.showLoading &&
					<View style={styles.deviceInfo}>
						<Text style={styles.title}>⏳</Text>
					</View>		
				}
			</View>
		);
	}
}

//Componente de prueba para buscar exactamente qué permisos necesita el motorola g5
// Usa la estrategia de "functional component"
const Prueba = () => {
	
	const [permissions, setPermissions] = useState([
		{
			id:PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			name:'ACCESS_FINE_LOCATION'
		},
		{
			id:PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
			name:'BLUETOOTH_SCAN'
		},
		{
			id:PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
			name:'BLUETOOTH_CONNECT'
		}]);
	const [apiLevel, setApiLevel] = useState(0);
	const [androidVersion, setAndroidVersion] = useState(0);

	//equivale al componentDidMount
	useEffect(()=>{
		DeviceInfo.getManufacturer().then( (m)=>{
			console.log("Manufacturer: ", m)
		});
		DeviceInfo.getApiLevel().then((a) => {
			console.log("API Level: ", a);
			setApiLevel(a);
		  });
		setAndroidVersion(DeviceInfo.getSystemVersion());
		console.log("System Version: ", androidVersion);
		console.log("Model: ",DeviceInfo.getModel());
	});

	//Llamado por el boton de prueba de permiso
	const permitir = async (permiso)=>{
		console.log('Pidiendo permiso ', permiso.id);
		const granted = await PermissionsAndroid.request(permiso.id);


		setPermissions( prev=>
			prev.map( item=>
				{
					if( item.id === permiso.id){
						return{...item, status:granted}
					}
					else return item;
				}
			)
		 );
		 console.log(permissions);
	}

	const styles = StyleSheet.create({
		blocko:{
			width:'60%',
			backgroundColor: '#ddd',
			alignItems: 'center',
    		justifyContent: 'center',
			padding:15
		}
	});

	return (
	  <View style={styles.blocko}>
		<Text style={{fontSize:24,fontWeight:'black'}}>Prueba de BLE</Text>
		<Text style={{fontSize:18}}>API Level: {apiLevel}</Text>
		<Text style={{fontSize:18, marginBottom:20}}>Android version: {androidVersion}</Text>
		{permissions.map(permission=> (
			<View key={permission.name} width='100%'>
				<Button  title={permission.name}
				onPress={
					()=>{permitir(permission)}
				}></Button>
				<Text>{permission.status}</Text>
			</View>
		) )}
	  </View>
	);
};

export default function App() {
  return (
    <View style={styles.container}>	
		<Text style={styles.title}>BluetoothLE</Text>
		<BLEScanner />
    </View>
  );
}
//<PruebaPermiso></PruebaPermiso>
//<Prueba />	

const styles = StyleSheet.create({
  container: {
	flex:1,
	padding:20,
	alignItems:'center',
    backgroundColor: '#aaa',
  },
  title:{
	fontSize:24,
	fontWeight:'bold',
	marginBottom:10
  },
  subtitle:{
	fontSize:20,
	marginBottom:10
  },
  content:{
	backgroundColor:'#fff',
	flex:1,
	width: '100%',
	padding:15,
	borderRadius:10
  },
  cell: {
    backgroundColor: '#1c1c1e', 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 1,
  },
  cellText: {
    color: '#f2f2f7', 
    fontFamily: 'monospace',
    fontSize: 16,
    lineHeight: 24,
  },
  deviceInfo:
  {
	position:'absolute',
	top: 0,
    left: 0,
    bottom: 0,
    right:0, // Adjust the width of the drawer
	padding:15,
	alignItems:'center',
	justifyContent: 'center',
	backgroundColor: '#ddf',
	elevation:6
  },
  deviceInfoCloseButton:
  {
	fontSize:38,
	position:'absolute',
	right:0,
	top:0,
	width:60,
	height:60
  },
  deviceInfoRow:{
	flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'lightgray',
    padding: 3,
  },
  deviceInfoLabel:{
	flex:0.3,
  },
  deviceInfoDatum:{
	flex:0.7,
	fontFamily: 'monospace',
  }
});
