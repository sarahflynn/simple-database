
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Store = require('../lib/store');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');



describe('creates file', () => {
    
    const dbPath = path.join(__dirname, 'animals');

    beforeEach(done => {
        rimraf(dbPath, err => {
            if(err && err.code !== 'ENOENT') done(err);
            else {
                mkdirp(dbPath, err => {
                    if(err) return done(err);
                    else done();
                });
            }
        });
    });

    describe('save method', () => {
        
        it('adds an id to an object', done => {
            const store = new Store(dbPath);
            store.save({ animal: 'dog' }, (err, animal) => {
                if(err) return done(err);
                
                assert.ok(animal._id);
                done();
            });
        });
        
        it('saves the object to a file with a name of <_id>.json', done => {
            const store = new Store(dbPath);
            store.save({ animal: 'dog' }, (err, animal) => {
                if(err) return done(err);
                const file = fs.readFileSync(path.join(dbPath, `${animal._id}.json`), 'utf8');
                assert.equal(JSON.parse(file).animal, 'dog');
                done();
            });
            
        });

    });

    describe('get method', () => {

        it('returns an object for a file based on provided id', done => {
            const store = new Store(dbPath);
            store.save({ animal: 'cat' }, (err, animal) => {
                if(err) return done(err);
                const file = JSON.parse(fs.readFileSync(path.join(dbPath, `${animal._id}.json`)), 'utf8');
                store.get(file._id, (err, animal) => {
                    if(err) return done(err);
                    assert.deepEqual(animal.animal, 'cat');
                    done();
                });
            });
        });

        it('returns null if no file with id exists', done => {
            const store = new Store(dbPath);
            store.get('afgo9GhVJ123', (err, animal) => {
                if(err) return done(err);
                assert.deepEqual(animal, null);
                done();
            });
        });

    });
    
    describe('remove method', () => {

        it('removes file with a provided id', done => {

            const store = new Store(dbPath);
            store.save({ animal: 'dog' }, (err, animal) => {
                if(err) return done(err);
                const file = JSON.parse(fs.readFileSync(path.join(dbPath, `${animal._id}.json`)), 'utf8');
                store.remove(file._id, (err, status) => {
                    if(err) return done(err);
                    assert.equal(status.removed, true);
                    done();
                });
            });

        });

        it('returns {removed: false} if passed an invalid id', done => {

            const store = new Store(dbPath);
            store.remove('badidtest', (err, status) => {
                if(err) {
                    assert.equal(status.removed, false);
                    done();
                }
            });

        });

    });

    describe('getAll method', () => {

        it('returns an array of all objects in directory', done => {
            const store = new Store(dbPath);
            store.save({ animal: 'cat' }, (err, cat) => {
                if(err) return done(err);
                store.save({ animal: 'dog' }, (err, dog) => {
                    if(err) return done(err);
                    store.getAll((err, animals) => {
                        if(err) return done(err);
                        const expected = [cat, dog].sort((a, b) => {
                            if(a._id > b._id) return 1;
                            if(a._id < b._id) return -1;
                            return 0;
                        });
                        assert.deepEqual(animals, expected);
                        done();
                    });
                });
            });
        });

    });

});
