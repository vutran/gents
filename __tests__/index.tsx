import gents from '../src';

describe('gents', () => {
    describe('basic types', () => {
        it('should convert a number', () => {
            const source = '{ "user_id": 1 }';
            const def = gents(source, 'User');
            expect(def).toMatchSnapshot();
        });
        it('should convert a string', () => {
            const source = '{ "name": "Vu Tran" }';
            const def = gents(source, 'User');
            expect(def).toMatchSnapshot();
        });
        it('should convert a Array of numbers', () => {
            const source = '{ "user_ids": [10, 20, 30] }';
            const def = gents(source, 'FooGroup');
            expect(def).toMatchSnapshot();
        });
        it('should convert a Array of strings', () => {
            const source =
                '{ "locations": ["San Francisco", "Los Angeles", "New York"] }';
            const def = gents(source, 'FooGroup');
            expect(def).toMatchSnapshot();
        });
        it('should convert a mixed Array of numbers and strings', () => {
            const source = '{ "mixed_items": ["apple", 1, "banana", 2] }';
            const def = gents(source, 'MixedGroup');
            expect(def).toMatchSnapshot();
        });
    });

    describe('subtypes', () => {
        it('should create subtypes for Arrays', () => {
            const source =
                '{ "locations": ["San Francisco", "Los Angeles", "New York"] }';
            const def = gents(source, 'FooGroup', { subtypes: true });
            expect(def).toMatchSnapshot();
        });
        it('should create multiple subtypes', () => {
            const source =
                '{ "locations": ["San Francisco", "Los Angeles", "New York"], "user_ids": [10, 20, 30] }';
            const def = gents(source, 'FooGroup', { subtypes: true });
            expect(def).toMatchSnapshot();
        });
    });
});
