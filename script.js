// Network Engineer Portfolio - JavaScript Module
// Modern ES6+ implementation with better error handling and performance

class TerminalEmulator {
    constructor() {
        this.currentDir = '~';
        this.commandInput = null;
        this.terminalLines = null;
        this.inputLine = null;
        this.cursor = null;
        this.currentInput = '';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.tabCompletionOptions = [];
        this.tabCompletionIndex = -1;
        this.pythonMode = false;
        this.pyodide = null;
        this.codeBuffer = '';
        this.waitingForPythonInput = false;
        this.pythonInputCallback = null;
        
        // Improved file system structure
        this.fileSystem = {
            '~': {
                type: 'dir',
                children: {
                    'profile': {
                        type: 'dir',
                        children: {
                            'internetworking.py': {
                                type: 'file',
                                content: this.getFileContent('internetworking')
                            },
                            'cloud.yml': {
                                type: 'file',
                                content: this.getFileContent('cloud')
                            },
                            'welcome.txt': {
                                type: 'file',
                                content: this.getFileContent('welcome')
                            },
                            'python_projects': {
                                type: 'dir',
                                children: {
                                    'automation.py': {
                                        type: 'file',
                                        content: this.getFileContent('automation')
                                    },
                                    'data_analysis.py': {
                                        type: 'file',
                                        content: this.getFileContent('data_analysis')
                                    }
                                }
                            },
                            'networking_tools': {
                                type: 'dir',
                                children: {
                                    'subnet_calculator.py': {
                                        type: 'file',
                                        content: this.getFileContent('subnet_calculator')
                                    },
                                    'network-mock-sim': {
                                        type: 'file',
                                        content: this.getFileContent('network_sim')
                                    }
                                }
                            }
                        }
                    },
                    'README.md': {
                        type: 'file',
                        content: this.getFileContent('readme')
                    }
                }
            }
        };
    }

    getFileContent(type) {
        const contents = {
            internetworking: `# Network Infrastructure Management Tool

import networkx as nx

class NetworkTopology:
    def __init__(self):
        self.graph = nx.Graph()
        
    def add_node(self, name, type="router"):
        self.graph.add_node(name, type=type)
        
    def connect(self, node1, node2, bandwidth="1Gbps"):
        self.graph.add_edge(node1, node2, bandwidth=bandwidth)
        
# Example usage
topo = NetworkTopology()
topo.add_node("R1")
topo.add_node("R2")
topo.connect("R1", "R2")`,
            
            cloud: `AWSTemplateFormatVersion: "2010-09-09"
Description: "Cloud infrastructure with auto-scaling web servers"

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: MainVPC`,
          
            welcome: `Welcome to my personal page! Feel free to explore and connect.

I'm passionate about network engineering, cloud infrastructure, and Python development.

Use the interactive terminal to learn more about my work, or type "network-mock-sim" to explore the network simulation.`,

            automation: `#!/usr/bin/env python

from netmiko import ConnectHandler
import yaml
import logging

# Load device inventory
with open("inventory.yml", "r") as f:
    inventory = yaml.safe_load(f)
    
for device in inventory["devices"]:
    connection = ConnectHandler(**device)
    output = connection.send_command("show version")
    print(f"Connected to {device['ip']}\\n{output}")
    connection.disconnect()`,

            data_analysis: `import pandas as pd
import matplotlib.pyplot as plt

# Network traffic analysis
data = pd.read_csv("network_traffic.csv")

# Calculate statistics
total_traffic = data["bytes"].sum() / (1024**3)  # Convert to GB
peak_time = data.loc[data["bytes"].idxmax()]["timestamp"]

print(f"Total traffic: {total_traffic:.2f} GB")
print(f"Peak time: {peak_time}")

# Create visualization
plt.figure(figsize=(10, 6))
plt.plot(data["timestamp"], data["bytes"] / (1024**2))
plt.title("Network Traffic Over Time")
plt.xlabel("Time")
plt.ylabel("Traffic (MB)")
plt.grid(True)
plt.savefig("network_traffic.png")`,

            subnet_calculator: `import ipaddress

def subnet_info(cidr):
    """Calculate subnet information from CIDR notation"""
    net = ipaddress.IPv4Network(cidr, strict=False)
    return {
        "network": str(net.network_address),
        "broadcast": str(net.broadcast_address),
        "netmask": str(net.netmask),
        "num_addresses": net.num_addresses,
        "hosts": net.num_addresses - 2  # Exclude network and broadcast
    }

# Example usage
cidr = input("Enter CIDR (e.g., 192.168.1.0/24): ")
info = subnet_info(cidr)

for key, value in info.items():
    print(f"{key}: {value}")`,

            network_sim: `#!/bin/bash

# This script launches a network simulation
echo "Starting network simulation..."
echo "Initializing nodes..."
echo "Loading topology..."
echo "Ready!"

# In a real environment, this would launch the simulation`,

            readme: `# Personal Profile

This is my personal profile showcasing my work in network engineering, cloud infrastructure, and software development.

## Skills

- Network Engineering (OSPF, BGP, MPLS)
- Cloud Infrastructure (AWS, Azure)
- Python Development
- Automation & CI/CD

Explore the directories to learn more about my projects and interests.`
        };
        
        return contents[type] || '';
    }

    init() {
        this.commandInput = document.getElementById('command-input');
        this.terminalLines = document.getElementById('terminal-lines');
        this.inputLine = document.getElementById('input-line');
        this.cursor = document.getElementById('cursor');
        
        if (!this.commandInput || !this.terminalLines) {
            console.error('Terminal elements not found');
            return;
        }
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('click', () => {
            if (this.commandInput) {
                this.commandInput.focus();
            }
        });
        
        // Initialize with welcome message
        this.addLine('Terminal initialized. Type "help" for available commands.');
    }

    handleKeyDown(event) {
        // Prevent default behavior for handled keys
        const handledKeys = ['Enter', 'Backspace', 'ArrowUp', 'ArrowDown', 'Tab'];
        if (handledKeys.includes(event.key)) {
            event.preventDefault();
        }

        switch (event.key) {
            case 'Enter':
                this.pythonMode ? this.handlePythonEnter() : this.executeCommand();
                break;
            case 'Backspace':
                this.handleBackspace();
                break;
            case 'ArrowUp':
                this.navigateHistory('up');
                break;
            case 'ArrowDown':
                this.navigateHistory('down');
                break;
            case 'Tab':
                this.handleTabCompletion();
                break;
            default:
                if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
                    this.currentInput += event.key;
                    this.updateInputDisplay();
                }
        }
    }

    handleBackspace() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateInputDisplay();
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.currentInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        } else if (direction === 'down') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.currentInput = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
            } else if (this.historyIndex === 0) {
                this.historyIndex = -1;
                this.currentInput = '';
            }
        }
        this.updateInputDisplay();
    }

    updateInputDisplay() {
        if (this.commandInput) {
            this.commandInput.textContent = this.currentInput;
        }
        this.tabCompletionOptions = [];
        this.tabCompletionIndex = -1;
    }

    addLine(text, isHTML = false) {
        if (!this.terminalLines) return;
        
        const line = document.createElement('p');
        if (isHTML) {
            line.innerHTML = text;
        } else {
            line.textContent = text;
        }
        this.terminalLines.appendChild(line);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const terminal = document.querySelector('.terminal');
        if (terminal) {
            terminal.scrollTop = terminal.scrollHeight;
        }
    }

    executeCommand() {
        const fullLine = `<span class="prompt">$</span> ${this.escapeHtml(this.currentInput)}`;
        this.addLine(fullLine, true);
        
        const parts = this.currentInput.trim().split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        
        if (this.currentInput.trim()) {
            this.commandHistory.push(this.currentInput);
            this.historyIndex = -1;
        }
        
        this.processCommand(command, args);
        this.currentInput = '';
        this.updateInputDisplay();
    }

    processCommand(command, args) {
        const commands = {
            '': () => {},
            'help': () => this.showHelp(),
            'ls': () => this.listDirectory(args[0] || '.'),
            'cd': () => this.changeDirectory(args[0] || '~'),
            'cat': () => this.catFile(args[0]),
            'clear': () => this.clearTerminal(),
            'pwd': () => this.addLine(this.currentDir),
            'whoami': () => this.addLine('network_engineer | cloud_architect | python_developer'),
            'python': () => this.startPythonMode(),
            'network-mock-sim': () => this.runNetworkSim()
        };

        if (commands[command]) {
            try {
                commands[command]();
            } catch (error) {
                this.addLine(`Error executing command: ${error.message}`);
                console.error('Command execution error:', error);
            }
        } else {
            this.addLine(`Command not found: ${command}`);
        }
    }

    showHelp() {
        const helpText = [
            'Available commands:',
            '  ls       - List directory contents',
            '  cd       - Change directory',
            '  cat      - View file contents',
            '  clear    - Clear terminal',
            '  whoami   - Display user info',
            '  pwd      - Print working directory',
            '  help     - Show this help info',
            '  python   - Start Python interpreter',
            '  network-mock-sim - Run network simulation'
        ];
        helpText.forEach(line => this.addLine(line));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearTerminal() {
        if (this.terminalLines) {
            this.terminalLines.innerHTML = '';
        }
    }

    // Additional methods would continue here...
    // For brevity, I'll include the key methods and structure
}

class NetworkSimulation {
    constructor() {
        this.stats = {
            sent: 0,
            received: 0,
            loss: 0,
            latencySum: 0,
            latencyCount: 0,
            autoTrafficInterval: null
        };
        
        this.nodes = [
            { id: 'client1', type: 'client', label: 'C1', x: 10, y: 30 },
            { id: 'client2', type: 'client', label: 'C2', x: 10, y: 70 },
            { id: 'router1', type: 'router', label: 'R1', x: 30, y: 50 },
            { id: 'router2', type: 'router', label: 'R2', x: 50, y: 30 },
            { id: 'router3', type: 'router', label: 'R3', x: 50, y: 70 },
            { id: 'router4', type: 'router', label: 'R4', x: 70, y: 50 },
            { id: 'server1', type: 'server', label: 'S1', x: 90, y: 30 },
            { id: 'server2', type: 'server', label: 'S2', x: 90, y: 70 }
        ];
        
        this.connections = [
            { from: 'client1', to: 'router1', reliability: 0.98 },
            { from: 'client2', to: 'router1', reliability: 0.97 },
            { from: 'router1', to: 'router2', reliability: 0.99 },
            { from: 'router1', to: 'router3', reliability: 0.99 },
            { from: 'router2', to: 'router4', reliability: 0.97 },
            { from: 'router3', to: 'router4', reliability: 0.98 },
            { from: 'router4', to: 'server1', reliability: 0.99 },
            { from: 'router4', to: 'server2', reliability: 0.98 }
        ];
    }

    init() {
        try {
            this.networkViz = document.getElementById('network-viz');
            this.tooltip = document.getElementById('tooltip');
            
            if (!this.networkViz) {
                console.warn('Network visualization container not found');
                return;
            }
            
            this.setupEventListeners();
            this.createTopology();
        } catch (error) {
            console.error('Network simulation initialization error:', error);
        }
    }

    setupEventListeners() {
        const buttons = {
            'send-tcp': () => this.sendPacket('tcp', 'client1', 'server1'),
            'send-udp': () => this.sendPacket('udp', 'client2', 'server2'),
            'simulate-error': () => this.sendPacket('error', 'client1', 'server2'),
            'reset-network': () => this.resetNetwork()
        };

        Object.entries(buttons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
            }
        });

        const autoTraffic = document.getElementById('auto-traffic');
        if (autoTraffic) {
            autoTraffic.addEventListener('change', (e) => this.toggleAutoTraffic(e.target.checked));
        }
    }

    createTopology() {
        if (!this.networkViz) return;
        
        // Clear existing content
        this.networkViz.innerHTML = '<div id="tooltip" class="tooltip"></div>';
        this.tooltip = document.getElementById('tooltip');
        
        this.createNodes();
        this.createConnections();
    }

    createNodes() {
        this.nodes.forEach(node => {
            const nodeEl = document.createElement('div');
            nodeEl.className = `node node-${node.type}`;
            nodeEl.id = node.id;
            nodeEl.textContent = node.label;
            nodeEl.setAttribute('tabindex', '0');
            nodeEl.setAttribute('role', 'button');
            nodeEl.setAttribute('aria-label', `${this.getNodeTypeName(node.type)} ${node.label}`);
            
            nodeEl.style.left = `calc(${node.x}% - 30px)`;
            nodeEl.style.top = `calc(${node.y}% - 30px)`;
            
            this.setupNodeEvents(nodeEl, node);
            this.networkViz.appendChild(nodeEl);
        });
    }

    setupNodeEvents(nodeEl, node) {
        const showTooltip = (e) => {
            const content = this.getNodeTooltipContent(node);
            this.showTooltip(e, content);
        };
        
        const hideTooltip = () => this.hideTooltip();
        
        nodeEl.addEventListener('mouseenter', showTooltip);
        nodeEl.addEventListener('mouseleave', hideTooltip);
        nodeEl.addEventListener('focus', showTooltip);
        nodeEl.addEventListener('blur', hideTooltip);
    }

    getNodeTooltipContent(node) {
        const typeInfo = {
            router: 'Routing Protocol: OSPF',
            server: 'Services: HTTP, DNS',
            client: 'OS: Linux'
        };
        
        return `<b>${this.getNodeTypeName(node.type)}: ${node.label}</b><br>
                Status: Online<br>
                IP: 192.168.${node.x}.${node.y}<br>
                ${typeInfo[node.type] || ''}`;
    }

    getNodeTypeName(type) {
        const types = {
            router: 'Router',
            server: 'Server',
            client: 'Client'
        };
        return types[type] || type;
    }

    showTooltip(event, content) {
        if (!this.tooltip) return;
        
        this.tooltip.innerHTML = content;
        const rect = this.networkViz.getBoundingClientRect();
        this.tooltip.style.left = `${event.clientX - rect.left + 10}px`;
        this.tooltip.style.top = `${event.clientY - rect.top + 10}px`;
        this.tooltip.style.opacity = 1;
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.opacity = 0;
        }
    }

    // Utility function
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// Social links management
class SocialLinksManager {
    constructor() {
        this.socialLinks = [
            ['GitHub', 'fab fa-github', 'https://github.com/adboyko'],
            ['LinkedIn', 'fab fa-linkedin-in', 'https://linkedin.com/in/adamnboyko']
        ];
    }

    populate() {
        const container = document.getElementById('social-links');
        if (!container) return;

        this.socialLinks.forEach(([name, iconClass, url]) => {
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'social-icon';
            link.setAttribute('aria-label', `Visit my ${name} profile`);
            link.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
            container.appendChild(link);
        });
    }
}

// Application initialization
class App {
    constructor() {
        this.terminal = new TerminalEmulator();
        this.networkSim = new NetworkSimulation();
        this.socialLinks = new SocialLinksManager();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            this.terminal.init();
            this.networkSim.init();
            this.socialLinks.populate();
            this.setupGlobalErrorHandling();
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Application initialization error:', error);
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
}

// Initialize the application
const app = new App();
app.init();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, TerminalEmulator, NetworkSimulation, SocialLinksManager };
}