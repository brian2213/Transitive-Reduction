$(document).ready(function() {
// create an array with nodes
var nodes = new vis.DataSet(nodedata);

  var nodedata=[];
  var edgedata=[];
  //graph variables
  // var nodedata=[1,2,3,4,5];
  // var edgedata=[
  // {from: 1, to: 2 ,arrows:'to'},
  // {from: 1, to: 3,arrows:'to'},
  // {from: 1, to: 4,arrows:'to'},
  // {from: 1, to: 5,arrows:'to'},
  // {from: 2, to: 4,arrows:'to'},
  // {from: 3, to: 4,arrows:'to'},
  // {from: 3, to: 5,arrows:'to'},
  // {from: 4, to: 5,arrows:'to'}
  // ];
  // create an array with edges
  var edges = new vis.DataSet(edgedata);

  // create a network
  var container = document.getElementById('mynetwork');
  var data = {
    nodes: nodes,
    edges: edges
  };
  var options = {
    interaction:{hover:true},
    manipulation: {
      enabled: true,
      addNode: function(nodeData,callback) {
        var newnode=nodedata.length+1;
        nodeData.id=newnode;
        nodeData.label = newnode.toString();
        nodedata.push(newnode);
        callback(nodeData);
      },
      deleteNode: function(nodeData,callback) {
        for(i=0;i<nodedata.length;i++){
          if(nodedata[i]==nodeData.id)
            nodedata.splice(i,1);
        }
        for(i=0;i<edgedata.length;i++){
          if(edgedata[i].from==nodeData.id||edgedata[i].to==nodeData.id)
            edgedata.splice(i,1);
        }
        callback(nodeData);
      },
      addEdge: function(edgeData,callback) {
        edgeData.arrows='to';
        for(i=0;i<edgedata.length;i++){
          if(edgedata[i].from==edgeData.from&&edgedata[i].to==edgeData.to)
          {
            var r = confirm("Edge repeated");
            callback(null);
            return;
          }
        }
        edgedata.push({from:edgeData.from,to:edgeData.to,arrows:'to'});
        
        callback(edgeData);
        
      },
      deleteEdge: function(edgeData,callback) {
        for(i=0;i<edgedata.length;i++){
          if(edgedata[i].from==edgeData.from&&edgedata[i].to==edgeData.to)
            edgedata.splice(i,1);
        }
        callback(edgeData);
      },
      editEdge: function(edgeData,callback) {
        for(i=0;i<edgedata.length;i++){
          if(edgedata[i].from==edgeData.from&&edgedata[i].to==edgeData.to)
            edgedata.splice(i,1);
        }
        edgedata.push({from:edgeData.from,to:edgeData.to,arrows:'to'});
        callback(edgeData);
      }
    }
  };
  var network = new vis.Network(container, data, options);
  network.on("selectEdge", function (params) {
    console.log('selectEdge Event:', params);
  });
  var preservedEdges=[];

  $(document).delegate(".parseFile",'change',function(){

    //dealing with input
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      var numberOfLineBreaks = (text.match(/\n/g)||[]).length;
      var splitted = text.split("\n");
      nodedata=[];
      edgedata=[];
      preservedEdges=[];
      var mySet = new Set();
      for(i=1;i<=numberOfLineBreaks;i++){
        //parse file and create edges data
        if(splitted[i]=='') break;
        var temp=splitted[i].trim().split(/[ ,]+/);
        edgedata[i-1]={from:Number(temp[0]),to:Number(temp[1]),arrows:'to'};
        if(temp[2]==1)
          preservedEdges.push({from:Number(temp[0]),to:Number(temp[1])});
        mySet.add(temp[0]);
        mySet.add(temp[1]);
      }
      var tmpi=0;
      //create nodes
      for(let item of mySet.values()){
        nodedata[tmpi++]={id:item,label:item};
      }
      //create graph object 
      nodes = new vis.DataSet(nodedata);
      edges = new vis.DataSet(edgedata);
      data = {
        nodes: nodes,
        edges: edges
      };
      network = new vis.Network(container, data, options);
    };
    reader.readAsText(input.files[0]);
  });


  $(document).delegate(".reduceBtn","click",function(){

      //initialize path matrix
      var matrix=[];
      for(i=0;i<nodedata.length;i++){
        var temp=[]; 
        for(j=0;j<nodedata.length;j++){
          temp.push(0)
        }
        matrix.push(temp);
      }

      //fill edges to matrix
      for(i=0;i<edgedata.length;i++){
        matrix[edgedata[i].from-1][edgedata[i].to-1]=1;
      }
          // transitive closure
    for ( k = 0; k < matrix.length; k++)
      for ( i = 0; i < matrix.length; i++)
          for ( j = 0; j < matrix.length; j++)
            if (matrix[i][k]==1&&matrix[k][j]==1&&i!=j)
              matrix[i][j] = 1;
    // transitive reduction
    for ( j = 0; j < matrix.length; j++)
      for ( i = 0; i < matrix.length; i++)
        if (matrix[i][j]==1)
          for ( k = 0; k < matrix.length; k++)
            if (matrix[j][k]==1)
              matrix[i][k] = 0;

      //redraw graph
      edgedata=[];//reset
      var num=0;
      for(i=0;i<matrix.length;i++){
        for(j=0;j<matrix.length;j++){
          if(matrix[i][j]==1){
            edgedata[num]={from:(i+1),to:(j+1),arrows:'to'};
            num++;
          }
        }
      }
      //adding back the preversed edges
      for(i=0;i<preservedEdges.length;i++){
        edgedata[num]={from:(preservedEdges[i].from),to:(preservedEdges[i].to),arrows:'to'};
        num++;
      }

      //nodes = new vis.DataSet(nodedata);
      edges = new vis.DataSet(edgedata);
      data = {
        nodes: nodes,
        edges: edges
      };
      network = new vis.Network(container, data, options);
    });

  $(document).delegate(".closeBtn","click",function(){

      //initialize path matrix
      var matrix=[];
      for(i=0;i<nodedata.length;i++){
        var temp=[]; 
        for(j=0;j<nodedata.length;j++){
          temp.push(0)
        }
        matrix.push(temp);
      }

      //fill edges to matrix
      for(i=0;i<edgedata.length;i++){
        matrix[edgedata[i].from-1][edgedata[i].to-1]=1;
      }

    // transitive closure
    for ( k = 0; k < matrix.length; k++)
      for ( i = 0; i < matrix.length; i++)
          for ( j = 0; j < matrix.length; j++)
            if (matrix[i][k]==1&&matrix[k][j]==1&&i!=j)
              matrix[i][j] = 1;

      //redraw graph
      edgedata=[];//reset
      var num=0;
      for(i=0;i<matrix.length;i++){
        for(j=0;j<matrix.length;j++){
          if(matrix[i][j]==1){
            edgedata[num]={from:(i+1),to:(j+1),arrows:'to'};
            num++;
          }
        }
      }
      //adding back the preversed edges
      for(i=0;i<preservedEdges.length;i++){
        edgedata[num]={from:(preservedEdges[i].from),to:(preservedEdges[i].to),arrows:'to'};
        num++;
      }

      //nodes = new vis.DataSet(nodedata);
      edges = new vis.DataSet(edgedata);
      data = {
        nodes: nodes,
        edges: edges
      };
      network = new vis.Network(container, data, options);
    });
});