import React, { useReducer } from 'react';

export interface IuseObjectList<T> {
	current: T[];
	push: (e: T) => void;
	concat: (e: T[]) => void;
	update: (updater: (e: T[]) => T[]) => void;
}

interface objectListAction<T> {
	type: 'push' | 'concat' | 'update';
	argT?: T;
	argTarr?: T[];
	argTcall?: (e: T[]) => T[];
}


export function useObjectList<T>(): IuseObjectList<T> {

	const [current, dispatch] = useReducer((old: T[], action: objectListAction<T>): T[] => {
		switch (action.type) {
			case 'push':
				if (action.argT) return [...old, action.argT];
				else return old
				break;
			case 'concat':
				if (action.argTarr) return [...old, ...action.argTarr];
				else return old;
				break;
			case 'update':
				if (action.argTcall) return action.argTcall(old);
				else return old;
				break;
			default:
					return old;
				break;
		}

	}, []);

	const push = (e: T) => {
		dispatch({
			type: 'push',
			argT: e,
		});
	}

	const concat = (e: T[]) => {
		dispatch({
			type: 'concat',
			argTarr: e
		});
	}

	const update = (updater: (e: T[]) => T[]) => {
		dispatch({
			type: 'update',
			argTcall: updater
		});
	}

	return {
		current,
		push,
		concat,
		update
	}

}
