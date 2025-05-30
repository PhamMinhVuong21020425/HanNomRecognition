import axios from '@/lib/axios';

/* Instruments */
import { createAppAsyncThunk } from '@/lib/redux/createAppAsyncThunk';
import type { ReduxThunkAction } from '@/lib/redux';
import { selectCount } from './selectors';
import { counterSlice } from './counterSlice';

// Define a thunk that fetches the current identity count from the server
const fetchIdentityCount = async (amount = 1): Promise<{ data: number }> => {
  const response = await axios.post(
    '/api/identity-count',
    JSON.stringify({ amount }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response;
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const incrementAsync = createAppAsyncThunk(
  'counter/fetchIdentityCount',
  async (amount: number) => {
    const response = await fetchIdentityCount(amount);

    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const incrementIfOddAsync =
  (amount: number): ReduxThunkAction =>
  (dispatch, getState) => {
    const currentValue = selectCount(getState());

    if (currentValue % 2 === 1) {
      dispatch(counterSlice.actions.incrementByAmount(amount));
    }
  };
