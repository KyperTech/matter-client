    var grout = new Grout();
    console.log('utils', grout.utils);


    //Set logged in status when dom is loaded
    document.addEventListener("DOMContentLoaded", function(event) {
      setStatus();
    });
    //Set status styles
    function setStatus() {
      var statusEl = document.getElementById("status");
      var logoutButton = document.getElementById("logout-btn");

      if(grout.isLoggedIn){
        statusEl.innerHTML = "True";
        statusEl.style.color = 'green';
        // statusEl.className = statusEl.className ? ' status-loggedIn' : 'status-loggedIn';
        logoutButton.style.display='inline';
      } else {
        statusEl.innerHTML = "False";
        statusEl.style.color = 'red';
        logoutButton.style.display='none';
      }
    }
    //Login user based on entered credentials
    function login(){
      console.log('Login called');
      var username = document.getElementById('login-username').value;
      var password = document.getElementById('login-password').value;

      grout.login({username:username, password:password}).then(function (loginInfo){
        console.log('successful login:', loginInfo);
        setStatus();
      }, function (err){
        console.error('login() : Error logging in:', err);
      });
    }
    //Log currently logged in user out
    function logout(){
      console.log('Logout called');
      grout.logout().then(function(){
        console.log('successful logout');
        setStatus();
      }, function (err){
        console.error('logout() : Error logging out:', err);
      });
    }
    //Signup and login as a new user
    function signup(){
      console.log('signup called');

      var name = document.getElementById('signup-name').value;
      var username = document.getElementById('signup-username').value;
      var email = document.getElementById('signup-email').value;
      var password = document.getElementById('signup-password').value;

      grout.signup().then(function(){
        console.log('successful logout');
        setStatus();
      }, function(err){
        console.error('logout() : Error logging out:', err);
      });
    }
    //Get list of applications
    function getApps(){
      console.log('getApps called');
      grout.Apps.get().then(function(appsList){
        console.log('apps list loaded:', appsList);
        var outHtml = '<h2>No app data</h2>';
        if (appsList) {
          outHtml = '<ul>';
          appsList.forEach(function(app){
            outHtml += '<li>' + app.name + '</li></br>'
          });
          outHtml += '</ul>';
        }
        document.getElementById("output").innerHTML = outHtml;
      });
    }
    //Get File/Folder structure for application
    function getStructure(){
      console.log('getStructure called');
      grout.App('Aventura').Files.buildStructure().then(function(fileStructure){
        console.log('structure loaded:', fileStructure);
        document.getElementById("output").innerHTML = JSON.stringify(fileStructure);
      });
      // var file = grout.App('Aventura').File({key: 'index.html', path: 'index.html'});
      // console.log('fbUrl', file.safePathArray);
      // console.log('fbUrl', file.safePath);
      // console.log('fbUrl', file.fbUrl);
      // console.log('fbRef', file.fbRef);
      // file.get().then(function(app){
      //   console.log('apps list loaded:', app);
      //   document.getElementById("output").innerHTML = JSON.stringify(app);
      // });
    }
    function getFile() {
      var file = grout.App('Aventura').File({key: 'index.html', path: 'index.html'});
      console.log('fbUrl', file.fbUrl);
      console.log('fbRef', file.fbRef);
      file.get().then(function(app){
        console.log('file loaded:', app);
        document.getElementById("output").innerHTML = JSON.stringify(app);
      });
    }
    //Get File/Folder structure for application
    function getFirepad(){
      console.log('getStructure called');
      // grout.App('exampleApp').Files.buildStructure().then(function(app){
      //   console.log('apps list loaded:', app);
      //   document.getElementById("output").innerHTML = JSON.stringify(app);
      // });
      var file = grout.App('Aventura').File({name: 'index.html', key: 'index.html', path: 'index.html'});
      //// Create ACE
      var editor = ace.edit("firepad-container");
      editor.setTheme("ace/theme/textmate");
      var session = editor.getSession();
      session.setUseWrapMode(true);
      session.setUseWorker(false);
      session.setMode("ace/mode/javascript");
      file.openInFirepad(editor).then(function(openFile){
        file.getConnectedUsers().then(function(users){
          document.getElementById("output").innerHTML = JSON.stringify(users);
        });
      });


      console.log('fbUrl', file.fbUrl);
      console.log('fbRef', file.fbRef);
      // file.get().then(function(fileRes){
      //   console.log('file loaded', fileRes);
      //   fileRes.firepadFromAce(editor);
      // });
    }
    //Get list of users
    function getUsers(){
      console.log('getUsers called');
      grout.Users.get().then(function(app){
        console.log('apps list loaded:', app);
        document.getElementById("output").innerHTML = JSON.stringify(app);
      }, function(err){
        console.error('Error getting users:', err);
      });
    }
    //Search users based on a provided string
    function searchUsers(searchStr){
      console.log('getUsers called');
      if(!searchStr){
        searchStr = document.getElementById('search').value;
      }
      grout.Users.search(searchStr).then(function(users){
        console.log('search users loaded:', users);
        document.getElementById("search-output").innerHTML = JSON.stringify(users);
      });
    }
