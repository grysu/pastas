package data;

import java.text.SimpleDateFormat;
import java.util.ArrayList;

public class Patient {
	private Long pid;
	private int ageGroup = -1;
	private ArrayList<Contact> contacts = new ArrayList<Contact>();

	public Patient(Long pid) {
		this.pid = pid;
	}
	
	public Long getPid() {
		return pid;
	}

	public void setPid(Long pid) {
		this.pid = pid;
	}

	public int getAgeGroup() {
		return ageGroup;
	}

	public void setAgeGroup(int ageGroup) {
		this.ageGroup = ageGroup;
	}

	public ArrayList<Contact> getContacts() {
		return contacts;
	}

	public void setContacts(ArrayList<Contact> contacts) {
		this.contacts = contacts;
	}
	
	public void convertLine(String line, int type) {
		SimpleDateFormat format = null;
		String[] split = line.split(";");
		pid = Long.valueOf(split[0]).longValue();
	}

	@Override
	public String toString() {
		return "Patient [pid=" + pid + ", ageGroup=" + ageGroup + ", contacts="
				+ contacts + "]";
	}

}
