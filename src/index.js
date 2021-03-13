const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return response.status(404).json({ error: "User not found!"})
    }

    request.user = user;

    return next();
};

app.post('/users', (request, response) => {
	const { name, username } = request.body;

	const userAlreadyExists = users.some((user) => user.username === username);

	if (userAlreadyExists) {
        return response.status(400).json({ error: "User already exists!" });
    }

	users.push({
		id: uuidv4(),
		name,
		username,
		todos: []
	});

	const user = users.find((user) => user.username === username);

  // console.log(user)

	return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	const { user } = request;

	return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { title, deadline } = request.body;

	const todo = {
		id: uuidv4(),
		title,
		done: false,
		deadline: new Date(deadline),
		created_at: new Date()
	}

	user.todos.push(todo);

	return response.status(201).json(todo);
});




app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { user } = request;	
	const { title, deadline } = request.body;
	const { id } = request.params;
		
	const todo = user.todos.find(todo => todo.id === id);
	
	if(!todo){
		return response.status(404).send({error: 'Todo does not exists! '});
	}
	  
	todo.title = title;
	todo.deadline = deadline;
	
	return response.json(todo);	
});



app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;

	const todo = user.todos.find((todo) => todo.id === id);

	if(!todo) {
		return response.status(404).json({ error: "Todo not found!" })
	};

	todo.done = true;

	return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;

	const todo = user.todos.find(todo => todo.id === id);
	
	if(!todo) {
		return response.status(404).json({ error: "Todo not found!" })
	};

	user.todos.splice(todo, 1);

	return response.status(204).send();
});

module.exports = app;