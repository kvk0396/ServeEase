package com.servicefinder.dto;

public class ChatMessage {
	
	    private String role;    // "user" or "assistant"
	    public String getRole() {
			return role;
		}
		public void setRole(String role) {
			this.role = role;
		}
		public String getContent() {
			return content;
		}
		public void setContent(String content) {
			this.content = content;
		}
		public ChatMessage(String role, String content) {
			super();
			this.role = role;
			this.content = content;
		}
		public ChatMessage() {
			super();
			// TODO Auto-generated constructor stub
		}
		private String content;
	    // constructors, getters, setters
	
}
