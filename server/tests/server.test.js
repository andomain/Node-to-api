const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/Todo');

const testData = [{
    _id: new ObjectID(),
    text: 'todo1'
},{
    _id: new ObjectID(),
    text: 'todo2'
}]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(testData);
    }).then(() => done());
});

describe('POST /todos', () => {
    const originalLength = testData.length;
    it('should create a new Todo', (done) => {
        const text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) return done(err);

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(originalLength + 1);
                    expect(todos[originalLength].text).toBe(text);
                    done();
                }).catch(e => done(e));
            })
    });

    it('should not create an invalid Todo', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.find().then((todos) =>{
                    expect(todos.length).toBe(testData.length);
                    done();
                }).catch(e => done(e));
            })
    })
});

describe('GET /todos', () => {
    it('should get all Todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(testData.length);
            }).end(done);
    })
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${testData[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(testData[0].text);
            }).end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${ObjectID(123).toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const id = testData[0]._id.toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id);
            }).end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then((todo) => {
                    expect(todo).toBeNull();
                    done();
                }).catch(e => done(e));
            })
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .delete(`/todos/${ObjectID(123).toHexString()}`)
            .expect(404)
            .end(done);        
    });

    it('should return 404 if Object ID is invalid', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);        
    });


});