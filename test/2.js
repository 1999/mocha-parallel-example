describe(__filename, function () {
    this.timeout(0);

    it('should wait for 1 seconds', function (done) {
        setTimeout(done, 1000);
    });
});
