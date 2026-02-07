# Makefile for FidoNet Simulator

PID_FILE = .server.pid
LOG_FILE = server.log
PORT = 5175

.PHONY: start stop restart clean status help test lint

help:
	@echo "Available commands:"
	@echo "  make start    - Start the game server in background"
	@echo "  make stop     - Stop the game server"
	@echo "  make restart  - Restart the game server"
	@echo "  make status   - Check server status"
	@echo "  make test     - Run all tests once"
	@echo "  make lint     - Run linter check"
	@echo "  make clean    - Remove log and pid files"

start:
	@if [ -f $(PID_FILE) ]; then \
		echo "Server is already running with PID $$(cat $(PID_FILE))"; \
	else \
		echo "Starting server on port $(PORT)..."; \
		nohup npm run dev -- --port $(PORT) --host > $(LOG_FILE) 2>&1 & echo $$! > $(PID_FILE); \
		echo "Server started. Check $(LOG_FILE) for output."; \
	fi

stop:
	@if [ -f $(PID_FILE) ]; then \
		PID=$$(cat $(PID_FILE)); \
		echo "Stopping server (PID $$PID)..."; \
		kill $$PID 2>/dev/null || true; \
		rm $(PID_FILE); \
		echo "Server stopped."; \
	else \
		echo "Server is not running (PID file not found)."; \
	fi

restart: stop start

status:
	@if [ -f $(PID_FILE) ]; then \
		PID=$$(cat $(PID_FILE)); \
		if ps -p $$PID > /dev/null; then \
			echo "Server is running. PID: $$PID"; \
		else \
			echo "Server process $$PID not found, but PID file exists."; \
			echo "Cleaning up PID file..."; \
			rm $(PID_FILE); \
		fi \
	else \
		echo "Server is NOT running."; \
	fi

test:
	npm run test -- --run

lint:
	npm run lint

clean:
	@echo "Cleaning up logs and pid files..."; \
	rm -f $(PID_FILE) $(LOG_FILE)
