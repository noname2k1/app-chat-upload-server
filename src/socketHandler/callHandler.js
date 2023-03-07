module.exports = (io, socket) => {
    //Private
    socket.on('call-audio-request', (from, to, requesterSocketid, signal) => {
        from.socketid = requesterSocketid;
        from.signal = signal;
        from.type = 'audio';
        io.to(to).emit('call-audio-request', from);
        io.to(requesterSocketid).emit('call-audio-requester');
    });
    // socket.on('call-video-request', (from, to, requesterSocketid) => {
    //     from.socketid = requesterSocketid;
    //     io.to(to).emit('call-video-request', from);
    //     io.to(requesterSocketid).emit('calling', { isCaller: true, to });
    // });
    socket.on('accept-call-request', ({ signal, to }) => {
        console.log(to);
        io.to(to).emit('accept-call-requester', signal);
        io.to(socket.id).emit('accepter-call');
    });
    socket.on('decline-call-request', (callerSocketid) => {
        io.to(socket.id).emit('decline-person');
        io.to(callerSocketid).emit('decline-call-requester');
    });

    //Room
    socket.on('call-room-audio-request', (from) => {});
    socket.on('call-room-video-request', (from) => {});
};
