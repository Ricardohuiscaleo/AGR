// Neural Network Nodes para soluciones-part1
document.addEventListener('DOMContentLoaded', () => {
  const solucionesSection = document.getElementById('soluciones-part1');
  
  if (solucionesSection) {
    // Crear contenedor de red neuronal
    const networkContainer = document.createElement('div');
    networkContainer.className = 'neural-network';
    solucionesSection.appendChild(networkContainer);
    
    const nodes = [];
    const connections = [];
    
    // Crear nodos
    function createNodes() {
      for (let i = 0; i < 15; i++) {
        const node = document.createElement('div');
        node.className = 'neural-node';
        
        const x = Math.random() * 90 + 5; // 5% a 95%
        const y = Math.random() * 90 + 5;
        
        node.style.left = x + '%';
        node.style.top = y + '%';
        node.style.animationDelay = Math.random() * 3 + 's';
        
        networkContainer.appendChild(node);
        nodes.push({ element: node, x, y });
      }
    }
    
    // Crear conexiones entre nodos cercanos
    function createConnections() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = Math.sqrt(
            Math.pow(nodes[i].x - nodes[j].x, 2) + 
            Math.pow(nodes[i].y - nodes[j].y, 2)
          );
          
          if (distance < 30) { // Solo conectar nodos cercanos
            const connection = document.createElement('div');
            connection.className = 'neural-connection';
            
            const angle = Math.atan2(nodes[j].y - nodes[i].y, nodes[j].x - nodes[i].x);
            const length = distance;
            
            connection.style.left = nodes[i].x + '%';
            connection.style.top = nodes[i].y + '%';
            connection.style.width = length + 'vw';
            connection.style.transform = `rotate(${angle}rad)`;
            connection.style.animationDelay = Math.random() * 4 + 's';
            
            networkContainer.appendChild(connection);
            connections.push(connection);
          }
        }
      }
    }
    
    // Activar nodos aleatoriamente
    function activateRandomNodes() {
      // Desactivar todos
      nodes.forEach(node => node.element.classList.remove('active'));
      connections.forEach(conn => conn.classList.remove('active'));
      
      // Activar algunos nodos aleatorios
      const activeCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < activeCount; i++) {
        const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
        randomNode.element.classList.add('active');
      }
      
      // Activar algunas conexiones
      const activeConnections = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < activeConnections; i++) {
        const randomConn = connections[Math.floor(Math.random() * connections.length)];
        randomConn.classList.add('active');
      }
    }
    
    // Inicializar red
    createNodes();
    createConnections();
    
    // Activar nodos periódicamente
    setInterval(activateRandomNodes, 2000);
    activateRandomNodes(); // Activación inicial
  }
});