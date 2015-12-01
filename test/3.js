describe(__filename, function () {
    this.timeout(0);

    it('should wait for 1 second', function (done) {
        setTimeout(done, 1000);
    });
});
