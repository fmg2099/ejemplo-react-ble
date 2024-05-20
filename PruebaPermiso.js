import { Component } from "react";
import { PermissionsAndroid, StyleSheet, View, Button, Text,} from "react-native";

export default class PruebaPermiso extends Component{

	constructor(props) {
        super(props);
        this.state = {
            permissionStateAudio : 'no definido',
			permissionStateCamera : 'no definido'
        };
    }
	

	onCameraButton = async ()=>
	{
		console.log("pidiendo permiso de camara");
		this.setState( (prevState)=>({
			permissionStateCamera:'pidiendo permiso de camara'
		}));
		await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
		.then(result=>{
			console.log(result);
			this.setState( (prevState)=>({
				permissionStateCamera:result
			}));
		})
		.catch((err)=>{ console.log(err)})

	};

	onAudioButton = async ()=>
	{
		console.log("pidiendo permiso de microfono");
		this.setState( (prevState)=>({
			permissionStateAudio:'pidiendo permiso de microfono'
		}));
		await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
		.then(result=>{
			console.log(result);
			this.setState( (prevState) => ({
				permissionStateAudio:result
			}));
		})
		.catch((err)=>{ console.log(err)})
	};

	render()
	{
		return (
			<View style={styles.container}>
				<Text style={styles.item}>PRUEBA DE PERMISOS</Text>
				<View style={styles.item}>
					<Button title="CAMERA" 
					onPress={this.onCameraButton}></Button>
				</View>
				<Text>{this.state.permissionStateCamera}</Text>
				<View style={styles.item}>
					<Button title="RECORD_AUDIO" 
					onPress={this.onAudioButton}></Button>
				</View>
				<Text>{this.state.permissionStateAudio}</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container:{
		flex: 0,
		backgroundColor: '#ddd',
		alignItems: 'center',
		justifyContent: 'center',
		padding:25,
	},
	item:{
		margin:10,
	}
});