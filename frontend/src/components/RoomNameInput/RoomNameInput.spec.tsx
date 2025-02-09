import { render, screen, fireEvent } from '@testing-library/react';
import { SetStateAction, Dispatch } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import RoomNameInput from './RoomNameInput';

describe('RoomNameInputComponent', () => {
  let setRoomName: Dispatch<SetStateAction<string>>;
  let setHasError: Dispatch<SetStateAction<boolean>>;

  beforeEach(() => {
    setRoomName = vi.fn();
    setHasError = vi.fn();
  });

  it('should set the room name if the input is valid', () => {
    render(
      <RoomNameInput
        setRoomName={setRoomName}
        setHasError={setHasError}
        roomName="test-room"
        hasError={false}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new-test-room' } });

    expect(setHasError).toHaveBeenCalledWith(false);
    expect(setRoomName).toHaveBeenCalledWith('new-test-room');
  });

  it('should set the room name as lowercase even if the parameter is a mix of both lower and upper case', () => {
    render(
      <RoomNameInput
        setRoomName={setRoomName}
        setHasError={setHasError}
        roomName="test-room"
        hasError={false}
      />
    );

    const input = screen.getByRole('textbox');
    const newRoomName = 'thisIsANewRoom';
    fireEvent.change(input, { target: { value: newRoomName } });

    expect(setHasError).toHaveBeenCalledWith(false);
    expect(setRoomName).toHaveBeenCalledWith(newRoomName.toLowerCase());
  });

  it('should show an error if the input contains invalid characters', () => {
    render(
      <RoomNameInput
        setRoomName={setRoomName}
        setHasError={setHasError}
        roomName="test-room"
        hasError
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '%20' } });

    expect(setHasError).toHaveBeenCalledWith(true);
    expect(setRoomName).not.toHaveBeenCalled();
    expect(screen.getByText('No spaces or special characters allowed')).toBeInTheDocument();
  });

  it('should not show an error if the user erased the input', () => {
    render(
      <RoomNameInput
        setRoomName={setRoomName}
        setHasError={setHasError}
        roomName="test-room"
        hasError
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });

    expect(setHasError).toHaveBeenCalledWith(false);
    // The room name gets set to its original state
    expect(setRoomName).toHaveBeenCalledWith('');
  });
});
