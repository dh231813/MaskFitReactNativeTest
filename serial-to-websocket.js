const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

// Replace with your Arduino's serial port name (e.g., COM3, /dev/ttyUSB0)
const arduinoPort = new SerialPort({ path: 'COM4', baudRate: 115200 });
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// WebSocket server to broadcast data
const wss = new WebSocket.Server({ port: 8082 });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  parser.on('data', (data) => {
    try {
      ws.send(data); // Send data from Arduino to client
    } catch (error) {
      console.error('Error sending data to WebSocket client:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on ws://192.168.0.123:8082');
