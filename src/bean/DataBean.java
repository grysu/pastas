package bean;

import java.util.ArrayList;
import java.util.Date;

import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;

import com.google.gson.Gson;

import data.Contact;
import data.FileManager;

@ManagedBean
@SessionScoped
public class DataBean {
	private ArrayList<Contact> contacts = new ArrayList<Contact>();
	private ArrayList<Contact> testData = new ArrayList<Contact>();
	private FileManager fm = new FileManager();
	private Gson gson = new Gson();
	private Long pid;

	public DataBean() throws Exception {
		testData.add(new Contact(101L, "Service1", new Date(), 0));
		testData.add(new Contact(102L, "Service2", new Date(), 0));
//		contacts = fm.getContacts();
		pid = 40060942046L;
	}

	public Long getPid() {
		return pid;
	}

	public void setPid(Long pid) {
		contacts = fm.findContacts(pid);
//		System.out.println(contacts.size());
		this.pid = pid;
	}

	public FileManager getFm() {
		return fm;
	}

	public void setFm(FileManager fm) {
		this.fm = fm;
	}

	public String getContacts() {
		return gson.toJson(contacts);
	}

	public void setContacts(ArrayList<Contact> contacts) {
		this.contacts = contacts;
	}

	public void setTestData(ArrayList<Contact> contacts) {
		this.testData = contacts;
	}

	// public ArrayList<Contact> getTestData() {
	// return testData;
	// }
	public String getTestData() {
		return gson.toJson(testData);
	}

}
